import { Title } from "./Title.js";
import { LevelSelect } from "./LevelSelect.js";
import { HowTo } from "./HowTo.js";
import { Game } from "./Game.js";
import { Pause } from "./Pause.js";
import { Result } from "./Result.js";
export function createApp(manager, storage) {
  const app = {
    manager,
    storage,
    show(scene) {
      while (manager.current) manager.pop();
      manager.push(scene);
    },
    title() {
      app.show(new Title(app));
    },
    select() {
      app.show(new LevelSelect(app));
    },
    howTo() {
      app.show(new HowTo(app));
    },
    play(level) {
      app.show(new Game({ level, app }));
    },
    pause(game) {
      if (manager.current === game && !game.result) {
        game.drag = null;
        manager.push(new Pause(app, game));
      }
    },
    finish(level, result) {
      storage.record(level.id, result);
      app.show(new Result(app, level, result));
    },
  };
  return app;
}
