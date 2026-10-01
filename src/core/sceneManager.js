// Only the top scene receives updates and input; all stacked scenes render.
// Scenes may implement enter(manager), exit(), update(dt), render(ctx),
// onPointerDown/Move/Up/Cancel(pointer). Popping resumes the scene below.
export class SceneManager {
  constructor() {
    this.scenes = [];
  }
  get current() {
    return this.scenes.at(-1);
  }
  push(scene) {
    this.scenes.push(scene);
    scene.enter?.(this);
  }
  pop() {
    const scene = this.scenes.pop();
    scene?.exit?.();
    return scene;
  }
  replace(scene) {
    this.pop();
    this.push(scene);
  }
  update(dt) {
    this.current?.update?.(dt);
  }
  render(ctx) {
    for (const scene of this.scenes) scene.render?.(ctx);
  }
  onPointerDown(pointer) {
    this.current?.onPointerDown?.(pointer);
  }
  onPointerMove(pointer) {
    this.current?.onPointerMove?.(pointer);
  }
  onPointerUp(pointer) {
    this.current?.onPointerUp?.(pointer);
  }
  onPointerCancel(pointer) {
    this.current?.onPointerCancel?.(pointer);
  }
}
