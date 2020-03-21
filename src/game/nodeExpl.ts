import { Ability } from "./definitions/ability";
import { Cache } from "../app/main";
import { mkAccessTarget, TweenTo, Par, Seq, mkEff, Noop, Anim, Delay, embedEff } from "../app/animation";
import { easeOutQuint } from "../app/interpolation";
import { abilityExpl } from "./ability";
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
  const bg = new PIXI.Sprite(PIXI.Texture.WHITE);
  bg.tint = 0xFFAE42;
  bg.width = 480;
  bg.height = 100;
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
        display.title.text = ability.name;
        // main expl
        const expl = abilityExpl(ability);
        const formattedExpl = formatExpl(expl.mainExpl);
        const mainHeight = explNewlines(formattedExpl) * 35 + 60;
        display.bg.height = mainHeight;
        display.effects.text = formattedExpl;
        //side expl
        let i = 0;
        let sideHeightAcc = 0;
        expl.sideExpl.forEach(explText => {
          const sideHeight = explNewlines(explText.expl) * 35;
          display.statuses[i].container.y = sideHeightAcc + mainHeight + 10;
          display.statuses[i].bg.height = sideHeight;
          display.statuses[i].expl.text = explText.expl;
          display.statuses[i].container.visible = true;
          sideHeightAcc += sideHeight;
          i++;
        });
        while (i < maxSideExpl) {
          display.statuses[i].container.visible = false;
          i++;
        }
        display.loading.visible = false;
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
        const expl = abilityExpl(ability);
        display.effects.text = formatExpl(expl.mainExpl);
        let i = 0;
        expl.sideExpl.forEach(explText => {
          display.statuses[i].expl.text = explText.expl;
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

export function formatExpl(
  expl: string[]
): string {
  return "- " + expl.join("\n- ");
}

export function explNewlines(
  expl: string
) {
  return expl.split(/\r\n|\r|\n/).length;
}

export function combineExpl<A>(
  as: A[],
  f: (a: A, variables: Record<string, string>) => { mainExpl: (string | undefined), sideExpl: SideExpl[], variables: Record<string, string> }
): { mainExpl: string[], sideExpl: SideExpl[] } {
  const mainExpl: string[] = [];
  let sideExpl: SideExpl[] = [];
  let variables: Record<string, string> = {};
  as.forEach(a => {
    const expl = f(a, variables);
    if (expl.mainExpl !== undefined) {
      mainExpl.push(expl.mainExpl);
    }
    sideExpl = sideExpl.concat(expl.sideExpl);
    variables = expl.variables;
  });
  return { mainExpl, sideExpl };
}

export class StatusExpl {
  public readonly tag: "StatusExpl" = "StatusExpl";

  constructor(
    public readonly expl: string,
  ) {}
}

export class VarExpl {
  public readonly tag: "VarExpl" = "VarExpl";

  constructor(
    public readonly varId: number,
    public readonly expl: string,
  ) {}
}

export type SideExpl
   = StatusExpl
   | VarExpl
   ;

export function varIdToVarName(
  varId: number
): string {
  switch (varId) {
    case 0: return "X";
    case 1: return "Y";
    case 2: return "Z";
    default: throw `varIdToVarName: Unsupported Variable Count: ${varId}`;
  }
}

export function nextVarId(
  sideExpl: SideExpl[]
): number {
  if (sideExpl.length === 0) {
    return 0;
  }
  const varIds = sideExpl.map(e => {
    switch (e.tag) {
      // return -1 here so, if this happens to be the maximum
      // then the final return value is 0
      case "StatusExpl": return -1;
      case "VarExpl": return e.varId;
    }
  });
  return Math.max(...varIds) + 1;
}