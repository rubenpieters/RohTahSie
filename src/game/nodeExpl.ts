import { Ability } from "./definitions/ability";
import { Cache } from "../app/main";
import { mkAccessTarget, TweenTo, Par, Seq, mkEff, Noop, Anim, Delay, embedEff } from "../app/animation";
import { easeOutQuint } from "../app/interpolation";
import { abilityExplFormatted } from "./ability";
import { Display } from "./display";

export type NodeExplDisplay = {
  container: PIXI.Container,
  bg: PIXI.Sprite,
  nameBg: PIXI.Sprite,
  title: PIXI.BitmapText,
  effects: PIXI.BitmapText,
  loading: PIXI.Sprite,
  statuses: StatusExplDisplay[],
}

export type StatusExplDisplay = {
  container: PIXI.Container,
  bg: PIXI.Sprite,
  expl: PIXI.BitmapText,
}

const maxSideExpl = 3;

export function initializeNodeExpl(
  parentContainer: PIXI.Container,
  display: Display,
  cache: Cache,
): NodeExplDisplay {
  const container = new PIXI.Container();
  Object.assign(container, { x: 30, y: 15 });

  // initialize bgs
  const bg = new PIXI.Sprite(cache["card_bg"]);
  container.addChild(bg);
  const nameBg = new PIXI.Sprite(cache["card_name_bg"]);
  container.addChild(nameBg);

  // initialize title text
  const title = new PIXI.BitmapText("", {
    font: {
      name: "Bahnschrift",
      size: 32,
    },
    tint: 0xFF0000,
  });
  Object.assign(title, { x: 5, y: 5 });
  container.addChild(title);

  // intialize effect text
  const effects = new PIXI.BitmapText("", {
    font: {
      name: "Bahnschrift",
      size: 32,
    },
    tint: 0xFF0000,
  });
  Object.assign(effects, { x: 15, y: 60 });
  container.addChild(effects);

  // initializes status expl
  const statuses: StatusExplDisplay[] = [];
  for (let i = 0; i < maxSideExpl; i++) {
    const explContainer = new PIXI.Container();
    explContainer.x = 15;
    explContainer.y = 320 + 100 * i;
    explContainer.visible = false;
    container.addChild(explContainer);

    const statusExplBg = new PIXI.Sprite(PIXI.Texture.WHITE);
    statusExplBg.width = 480;
    statusExplBg.height = 50;
    explContainer.addChild(statusExplBg);
    // initialize side text
    const expl = new PIXI.BitmapText("", {
      font: {
        name: "Bahnschrift",
        size: 24,
      },
      tint: 0xFF0000,
    });
    Object.assign(expl, { x: 20, y: 10 });
    explContainer.addChild(expl);
    statuses.push({ bg: statusExplBg, expl, container: explContainer, });
  }

  // loading screen, obscures rest while loading the expl window
  const loading = new PIXI.Sprite(PIXI.Texture.WHITE);
  loading.tint = 0x000000;
  loading.width = 480;
  loading.height = 300;
  container.addChild(loading);

  container.visible = false;

  container.interactive = true;
  container.on("pointerdown", () => {
    display.player.nodeExpl.container.visible = false;
  });

  parentContainer.addChild(container);

  return { container, bg, nameBg, title, effects, loading, statuses };
}

export function loadNodeExpl(
  ability: Ability,
  display: NodeExplDisplay,
): Anim {
  return new Seq([
    new Delay(0.15),
    embedEff(() => {
      display.container.visible = true;
      display.loading.visible = true;
      for (let i = 0; i < maxSideExpl; i++) {
        display.statuses[i].container.visible = false;
      }
    }),
    new Delay(0.1),
    mkEff({
      eff: () => {
        display.loading.visible = false;
        display.title.text = ability.name;
        const expl = abilityExplFormatted(ability);
        display.effects.text = expl.mainExpl;
        let i = 0;
        Object.keys(expl.sideExpl).forEach(varName => {
          display.statuses[i].expl.text = expl.sideExpl[varName];
          display.statuses[i].container.visible = true;
          i++;
        });
        while (i < maxSideExpl) {
          display.statuses[i].container.visible = false;
          i++;
        }
      },
      k : () => new Noop(),
    }),
  ])
}

export function showNodeExpl(
  ability: Ability,
  display: NodeExplDisplay,
): Anim {
  return new Seq([
    mkEff({
      eff: () => {
        display.container.visible = true;
        display.title.text = ability.name;
        const expl = abilityExplFormatted(ability);
        display.effects.text = expl.mainExpl;
        let i = 0;
        Object.keys(expl.sideExpl).forEach(varName => {
          display.statuses[i].expl.text = expl.sideExpl[varName];
          display.statuses[i].container.visible = true;
          i++;
        });
        while (i < maxSideExpl) {
          display.statuses[i].container.visible = false;
          i++;
        }
      },
      k: () => new Noop(),
    }),
    new Par([
      new TweenTo(0.1, 45, "absolute", mkAccessTarget(display.container, "y"), easeOutQuint),
      new TweenTo(0.1, 1, "absolute", mkAccessTarget(display.container, "alpha"), easeOutQuint),
    ]),
  ]);
}

/*
export function hideNodeExpl(
  display: NodeExplDisplay,
): Anim {
  return new Seq([
    new TweenTo(0.1, 0, "absolute", mkAccessTarget(display.container, "alpha"), easeOutQuint),
    mkEff({
      eff: () => resetNodeExpl(display),
      k: () => new Noop(),
    }),
  ]);
}

export function resetNodeExpl(
  display: NodeExplDisplay,
) {
  display.container.visible = false;
  display.container.y = 15;
  display.container.alpha = 0;
}
*/

export function combineExpl<A>(
  as: A[],
  f: (a: A) => { mainExpl: string, sideExpl: { [K in string]: string } }
): { mainExpl: string[], sideExpl: { [K in string]: string } } {
  const mainExpl: string[] = [];
  let sideExpl = {};
  as.forEach(a => {
    const expl = f(a);
    mainExpl.push(expl.mainExpl);
    sideExpl = { ...sideExpl, ...expl.sideExpl };
  });
  return { mainExpl, sideExpl };
}