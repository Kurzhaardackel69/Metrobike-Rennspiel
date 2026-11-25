package de.metorbikeracing.game;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.res.Configuration;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Message;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;
import androidx.webkit.WebViewAssetLoader;

/** Bundled game, with ordinary external app links. No Spotify API or credentials. */
public final class MainActivity extends Activity {
    private static final String LOCAL_HOST = "appassets.androidplatform.net";
    private WebView web;
    private FrameLayout root;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        if (Build.VERSION.SDK_INT >= 28) getWindow().getAttributes().layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
        root = new FrameLayout(this); root.setBackgroundColor(Color.rgb(25,51,60));
        web = new WebView(this); root.addView(web, new FrameLayout.LayoutParams(-1,-1)); setContentView(root);
        WebSettings s=web.getSettings(); s.setJavaScriptEnabled(true); s.setDomStorageEnabled(true);
        s.setAllowFileAccess(false); s.setAllowContentAccess(false); s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        s.setMediaPlaybackRequiresUserGesture(true); s.setSupportMultipleWindows(true); s.setJavaScriptCanOpenWindowsAutomatically(false);
        web.setBackgroundColor(Color.rgb(241,240,233));
        WebViewAssetLoader loader = new WebViewAssetLoader.Builder().addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this)).build();
        web.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                WebResourceResponse response=loader.shouldInterceptRequest(request.getUrl());
                String path=request.getUrl().getPath();
                if(response!=null && path!=null && (path.endsWith(".mjs")||path.endsWith(".js"))) response.setMimeType("text/javascript");
                return response;
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri=request.getUrl(); if (isLocal(uri)) return false; openExternal(uri); return true;
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onCreateWindow(WebView view, boolean dialog, boolean gesture, Message result) {
                if (!gesture) return false;
                WebView target=new WebView(MainActivity.this);
                target.setWebViewClient(new WebViewClient() {
                    @Override public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest request) { openExternal(request.getUrl()); v.destroy(); return true; }
                });
                ((WebView.WebViewTransport)result.obj).setWebView(target); result.sendToTarget(); return true;
            }
        });
        web.addJavascriptInterface(new GameBridge(), "MetorbikeAndroid");
        root.setOnApplyWindowInsetsListener((view,insets)->{
            if (Build.VERSION.SDK_INT>=28 && insets.getDisplayCutout()!=null) {
                android.view.DisplayCutout c=insets.getDisplayCutout(); root.setPadding(c.getSafeInsetLeft(),c.getSafeInsetTop(),c.getSafeInsetRight(),c.getSafeInsetBottom());
            } else root.setPadding(0,0,0,0);
            return insets;
        });
        web.loadUrl("https://"+LOCAL_HOST+"/assets/www/index.html"); immersive();
    }
    private boolean isLocal(Uri uri) { return "https".equals(uri.getScheme()) && LOCAL_HOST.equals(uri.getHost()) && uri.getPath()!=null && uri.getPath().startsWith("/assets/www/"); }
    private void immersive() {
        if(Build.VERSION.SDK_INT>=30) { getWindow().setDecorFitsSystemWindows(false); WindowInsetsController c=getWindow().getInsetsController(); if(c!=null){c.hide(WindowInsets.Type.systemBars());c.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);} }
        else getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY|View.SYSTEM_UI_FLAG_FULLSCREEN|View.SYSTEM_UI_FLAG_HIDE_NAVIGATION|View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN|View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION|View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
    }
    private void event(String name) { if(web!=null) web.evaluateJavascript("window.dispatchEvent(new Event('metorbike:"+name+"'))",null); }
    private void openExternal(Uri uri) {
        if(uri==null) return;
        boolean spotify="spotify".equals(uri.getScheme()) && uri.toString().matches("spotify:playlist:[A-Za-z0-9]{22}");
        if(!spotify && !("https".equals(uri.getScheme()) && uri.getHost()!=null && uri.getUserInfo()==null)) return;
        Intent intent=new Intent(Intent.ACTION_VIEW,uri);
        if(spotify) intent.setPackage("com.spotify.music");
        try { startActivity(intent); }
        catch(ActivityNotFoundException e) { if(spotify) { String id=uri.toString().substring("spotify:playlist:".length()); startActivity(new Intent(Intent.ACTION_VIEW,Uri.parse("https://open.spotify.com/playlist/"+id))); } else Toast.makeText(this,"Kein Browser gefunden",Toast.LENGTH_LONG).show(); }
    }
    public final class GameBridge {
        @JavascriptInterface public void openSpotify(String id) { if(id!=null && id.matches("[A-Za-z0-9]{22}")) runOnUiThread(()->openExternal(Uri.parse("spotify:playlist:"+id))); }
        @JavascriptInterface public void closeGame() { runOnUiThread(()->{event("exit");finish();}); }
    }
    @Override protected void onPause(){ event("background"); super.onPause(); if(web!=null) web.onPause(); }
    @Override protected void onResume(){ super.onResume(); if(web!=null){web.onResume();event("foreground");} immersive(); }
    @Override public void onWindowFocusChanged(boolean focus){super.onWindowFocusChanged(focus);if(focus)immersive();}
    @Override public void onConfigurationChanged(Configuration config){super.onConfigurationChanged(config);immersive();event("foreground");}
    @Override public void onBackPressed(){if(web!=null&&web.canGoBack())web.goBack();else event("back");}
    @Override protected void onDestroy(){ if(web!=null){web.removeJavascriptInterface("MetorbikeAndroid");root.removeView(web);web.destroy();web=null;}super.onDestroy(); }
}
