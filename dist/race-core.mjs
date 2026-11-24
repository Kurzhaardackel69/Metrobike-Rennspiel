// Deterministic arcade race rules, independent of rendering and browser APIs.
export const TOTAL_LAPS = 3;
export const MAX_SPEED = 31;
export const BOOST_SPEED = 43;
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const wrap = (v, length) => ((v % length) + length) % length;
export function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '—';
  const centis = Math.floor(Math.max(0, seconds) * 100);
  return `${String(Math.floor(centis / 6000)).padStart(2, '0')}:${String(Math.floor(centis / 100) % 60).padStart(2, '0')}.${String(centis % 100).padStart(2, '0')}`;
}
export class Race {
  constructor(track, curvature = () => 0) {
    this.track = track; this.curvature = curvature; this.time = 0;
    this.player = { name: 'Du', progress: 0, offset: -1.6, speed: 0, boost: 1, boostActive: false, padTime: 0, lap: 1, laps: [], finished: false, finishTime: null, collisionCooldown: 0, padIndex: -1, steer: 0 };
    this.bots = ['Mika', 'Jules', 'Alex', 'Sam', 'Robin'].map((name, i) => ({name, progress: 7 + i * 6, offset: (i % 2 ? -1 : 1) * 2.3, speed: 0, cruise: 23.7 + i * .7, phase: i * 1.8, finished: false, finishTime: null, colorIndex: (i + 1) % 4}));
    this.events = []; this.lastSplit = 0;
  }
  get position() { return 1 + this.bots.filter(b => this.player.finished ? b.finished && b.finishTime < this.player.finishTime : b.progress > this.player.progress).length; }
  get standings() { return [this.player, ...this.bots].sort((a, b) => a.finished && b.finished ? a.finishTime - b.finishTime : b.progress - a.progress); }
  resetPlayer() { if (this.player.finished) return; this.player.offset = 0; this.player.speed *= .25; this.player.collisionCooldown = 1; this.events.push({type: 'reset'}); }
  update(dt, input = {}) {
    dt = clamp(dt, 0, .05); this.events.length = 0;
    const p = this.player; const finish = this.track.length * TOTAL_LAPS;
    if (p.finished) return;
    this.time += dt;
    p.collisionCooldown = Math.max(0, p.collisionCooldown - dt);
    p.padTime = Math.max(0, p.padTime - dt);
    const manualBoost = !!input.boost && p.boost > .025;
    p.boostActive = manualBoost || p.padTime > 0;
    p.boost = clamp(p.boost + (manualBoost ? -.29 : .085) * dt, 0, 1);
    const gas = input.gas || input.boost;
    const offroad = Math.abs(p.offset) > this.track.halfWidth;
    let maxSpeed = p.boostActive ? BOOST_SPEED : MAX_SPEED;
    if (offroad) maxSpeed *= .51;
    if (input.brake) p.speed = Math.max(0, p.speed - 28 * dt);
    else if (gas) p.speed = Math.min(maxSpeed, p.speed + (p.boostActive ? 16 : 10) * dt);
    else p.speed = Math.max(0, p.speed - 4.8 * dt);
    if (p.speed > maxSpeed) p.speed = Math.max(maxSpeed, p.speed - 22 * dt);
    p.steer = clamp(input.steer || 0, -1, 1);
    const bend = this.curvature(wrap(p.progress, this.track.length) / this.track.length);
    p.offset += (p.steer * (2.5 + p.speed * .34) - bend * p.speed * p.speed * .19) * dt * Math.min(1, p.speed / 3);
    const edge = this.track.halfWidth + (this.track.id === 'star' ? .15 : 4);
    if (Math.abs(p.offset) > edge) { p.offset = Math.sign(p.offset) * edge; p.speed *= Math.pow(.965, dt * 60); if (!p.collisionCooldown) { this.events.push({type:'edge'}); p.collisionCooldown = 1.1; } }
    const previousProgress = p.progress;
    p.progress += p.speed * dt;
    const section = wrap(p.progress, this.track.length) / this.track.length;
    const padIndex = this.track.pads.findIndex(t => Math.abs(section - t) < .006 && Math.abs(p.offset) < 3.8);
    if (padIndex >= 0 && p.padIndex !== padIndex) { p.padTime = 1.15; p.boost = clamp(p.boost + .12, 0, 1); this.events.push({type:'pad'}); }
    p.padIndex = padIndex;
    for (const b of this.bots) {
      if (b.finished) continue;
      const bt = wrap(b.progress, this.track.length) / this.track.length;
      const curve = Math.abs(this.curvature(bt));
      const target = b.cruise - Math.min(4, curve * 80) + Math.sin(this.time * .8 + b.phase) * 1.6;
      b.speed += (target - b.speed) * Math.min(1, dt * .8);
      b.progress += b.speed * dt;
      b.offset = Math.sin(b.progress * .012 + b.phase) * 2.7;
      const gap = b.progress - p.progress;
      if (Math.abs(gap) < 2.3 && Math.abs(b.offset - p.offset) < 1 && p.speed > 5 && p.collisionCooldown === 0) {
        p.speed *= .77; b.speed *= .88; p.offset += p.offset >= b.offset ? .55 : -.55;
        p.collisionCooldown = 1.2; this.events.push({type:'collision'});
      }
      if (b.progress >= finish) { b.finished = true; b.finishTime = this.time; b.progress = finish; }
    }
    const previousLap = Math.floor(previousProgress / this.track.length);
    const nextLap = Math.floor(p.progress / this.track.length);
    if (nextLap > previousLap) {
      // Interpolate the finish-line crossing inside this fixed physics step.
      const overshootTime = (p.progress - nextLap * this.track.length) / Math.max(p.speed, .01);
      const crossing = this.time - overshootTime;
      p.laps.push(crossing - this.lastSplit); this.lastSplit = crossing;
      p.lap = Math.min(TOTAL_LAPS, nextLap + 1);
      this.events.push({type: 'lap', lap: p.lap});
      if (p.progress >= finish) { p.finished = true; p.progress = finish; p.finishTime = crossing; this.events.push({type:'finish'}); }
    }
  }
}
