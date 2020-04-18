import { Display } from "./display";
import { allDirs, Dir } from "./dir";
import { Par, Seq, embedEff, TweenTo, Anim, TweenFromTo, mkAccessTarget } from "../app/animation";
import { Cache, attachAnimation } from "../app/main";
import { linear } from "../app/interpolation"
import { GameState } from "./state";
import { changeDirNode } from "./layout";
import { dirToAbility } from "./dirAbility";

export type DirSelectDisplay = {
  bg: PIXI.Sprite,
  container: PIXI.Container,
  dirBtns: PIXI.Sprite[],
  nodeIndex: number | undefined,
}

export function initializeDirSelect(
  parentContainer: PIXI.Container,
  state: GameState,
  display: Display,
  cache: Cache,
): DirSelectDisplay {
  const container = new PIXI.Container();
  Object.assign(container, { x: 280 - 67.5, y: 280 - 67.5 });

  // initialize bgs
  const bg = new PIXI.Sprite(PIXI.Texture.WHITE);
  bg.x = -15;
  bg.y = -15;
  bg.tint = 0xFFAE42;
  bg.width = 120;
  bg.height = 120;
  container.addChild(bg);

  bg.interactive = true;
  bg.on("pointerdown", () => container.visible = false);

  const dirBtns: PIXI.Sprite[] = [];
  let i = 0;
  for (let dir of allDirs) {
    const dirSelect = new PIXI.Sprite(cache["ability_slot_r"]);
    dirSelect.angle = i * 90;
    dirSelect.pivot.set(21, 21);
    /*
    0 1 2
    3 4 5
    6 7 8
    */
    let dir: Dir = undefined as any;
    switch (i) {
      case 0: { // right
        dirSelect.x = 2 * 45;
        dirSelect.y = 1 * 45;
        dir = "right";
        break;
      }
      case 1: { // down
        dirSelect.x =  1 * 45;
        dirSelect.y = 2 * 45;
        dir = "down";
        break;
      }
      case 2: { // left
        dirSelect.x = 0 * 45;
        dirSelect.y = 1 * 45;
        dir = "left";
        break;
      }
      case 3: { // up
        dirSelect.x = 1 * 45;
        dirSelect.y = 0 * 45;
        dir = "up";
        break;
      }
    }
    container.addChild(dirSelect);
    i += 1;

    dirSelect.interactive = true;
    // TODO: when clicking this, if there is a layout node under it, its pointerup triggers
    dirSelect.on("pointerdown", () => changeDir(state, display, dir, cache));

    dirBtns.push(dirSelect);
  }

  container.visible = false;

  parentContainer.addChild(container);

  return { bg, container, dirBtns, nodeIndex: undefined }
}

export function showDirSelect(
  display: DirSelectDisplay,
  nodeIndex: number,
): Anim {
  return new Seq([
    embedEff(() => {
      display.container.visible = true;
      display.nodeIndex = nodeIndex;
    }),
    new Par(display.dirBtns.map((x, i) => {
      return new Par([
        new TweenFromTo(0, 0.15, 0, 1, "setOnFrom", mkAccessTarget(display.dirBtns[i], "alpha"), linear),
        new TweenFromTo(0, 0.15, 1.3, 1, "setOnFrom", mkAccessTarget(display.dirBtns[i].scale, "x"), linear),
        new TweenFromTo(0, 0.15, 1.3, 1, "setOnFrom", mkAccessTarget(display.dirBtns[i].scale, "y"), linear),
      ]);
    })),
  ]);
}

export function changeDir(
  state: GameState,
  display: Display,
  dir: Dir,
  cache: Cache,
) {
  const index = display.player.dirSelect.nodeIndex;
  if (index === undefined) {
    throw "node index not set on dir select menu";
  }
  attachAnimation(new Seq([
    new Par([
      changeDirNode(state, display, index, dirToAbility(dir), cache),
      new Par(display.player.dirSelect.dirBtns.map((x, i) => {
        return new Par([
          new TweenFromTo(0, 0.15, 1, 0, "setOnFrom", mkAccessTarget(display.player.dirSelect.dirBtns[i], "alpha"), linear),
          new TweenFromTo(0, 0.15, 1, 1.3, "setOnFrom", mkAccessTarget(display.player.dirSelect.dirBtns[i].scale, "x"), linear),
          new TweenFromTo(0, 0.15, 1, 1.3, "setOnFrom", mkAccessTarget(display.player.dirSelect.dirBtns[i].scale, "y"), linear),
        ]);
      })),
    ]),
    embedEff(() => {
      display.player.dirSelect.container.visible = false;
      display.player.dirSelect.nodeIndex = undefined;
    }),
  ]));
}