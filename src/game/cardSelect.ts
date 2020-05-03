import { GameState } from "./state";
import { Display } from "./display";
import { Cache, attachAnimation } from "../app/main";
import { Par, Seq, embedEff, TweenTo, Anim, TweenFromTo, mkAccessTarget } from "../app/animation";
import { filterUndefined, fillUndefinedUpTo } from "../util/util";
import { Ability } from "./definitions/ability";
import { nodeSprite } from "./ability";
import { changeLayoutNode, changeDirNode } from "./layout";
import { DirAbility } from "./definitions/dirAbility";
import * as DAb from "./definitions/dirAbility";
import { dirAbilitySprite } from "./dirAbility";
import { wrappedLayout } from "../layout/layout";
import { CondCard, FalseCond } from "./definitions/condCard";
import { condCardSprite } from "./condCard";

const maxCardsX = 4;
const maxCardsY = 4;

export type CardDisplay = {
  cardContainer: PIXI.Container,
  bg: PIXI.Sprite,
  sprite: PIXI.Sprite,
  ability: Ability | undefined,
}

export type CondCardDisplay = {
  cardContainer: PIXI.Container,
  bg: PIXI.Sprite,
  sprite: PIXI.Sprite,
  ability: CondCard | undefined,
}

export type DirCardDisplay = {
  cardContainer: PIXI.Container,
  bg: PIXI.Sprite,
  sprite: PIXI.Sprite,
  ability: DirAbility | undefined,
}

export type CardSelectDisplay = {
  bg: PIXI.Sprite,
  container: PIXI.Container,
  cards: CardDisplay[],
  condContainer: PIXI.Container,
  condBg: PIXI.Sprite,
  condCards: CondCardDisplay[],
  condDirCards: DirCardDisplay[],
  dirCards: DirCardDisplay[],
  nodeIndex: number | undefined, // index of selected node in layout
  cardSelectIndex: number, // index of scrolling in card select
  condCardSelectIndex: number, // index of scrolling in cond card select
  cardSelectUpBtn: PIXI.Sprite,
  cardSelectDownBtn: PIXI.Sprite,
}

export function initializeCardSelect(
  parentContainer: PIXI.Container,
  state: GameState,
  display: Display,
  cache: Cache,
): CardSelectDisplay {
  const container = new PIXI.Container();
  Object.assign(container, { x: 280, y: 30 });

  // initialize bgs
  const bg = new PIXI.Sprite(PIXI.Texture.WHITE);
  bg.x = 0;
  bg.y = 0;
  bg.tint = 0xFFAE42;
  bg.width = 200;
  bg.height = 450;
  container.addChild(bg);

  bg.interactive = true;
  bg.on("pointerdown", () => container.visible = false);

  // create card display
  const cards: CardDisplay[] = wrappedLayout(
    container,
    i => {
      const cardContainer = new PIXI.Container();
      cardContainer.interactive = true;
      cardContainer.on("pointerdown", () => newAbilitySelect(state, display, cache, i));
      cardContainer.width = 42;
      cardContainer.height = 42;

      return cardContainer;
    },
    cardContainer => {
      const bg = new PIXI.Sprite(PIXI.Texture.WHITE);
      bg.tint = 0x00AAAA;
      bg.width = 42;
      bg.height = 42;
  
      const sprite = new PIXI.Sprite();
      sprite.x = 23;
      sprite.y = 23;
      sprite.pivot.set(21, 21);
  
      cardContainer.addChild(bg);
      cardContainer.addChild(sprite);

      return { cardContainer, bg, sprite, ability: undefined };
    },
    maxCardsX * maxCardsY,
    { orientation: "horizontal", spacing: { x: 45, y: 45 }, start: { x: 10, y: 10 }, wrappingLimit: 4, },
  );

  // up/down btns
  const cardSelectUpBtn = new PIXI.Sprite(PIXI.Texture.WHITE);
  cardSelectUpBtn.x = 100;
  cardSelectUpBtn.y = 190;
  cardSelectUpBtn.tint = 0x000000;
  cardSelectUpBtn.width = 30;
  cardSelectUpBtn.height = 10;
  container.addChild(cardSelectUpBtn);

  cardSelectUpBtn.interactive = true;
  cardSelectUpBtn.on("pointerdown", () => {
    display.player.cardSelect.cardSelectIndex += 4;
    updateCardSelectCards(state, display, cache);
  });

  const cardSelectDownBtn = new PIXI.Sprite(PIXI.Texture.WHITE);
  cardSelectDownBtn.x = 140;
  cardSelectDownBtn.y = 190;
  cardSelectDownBtn.tint = 0x000000;
  cardSelectDownBtn.width = 30;
  cardSelectDownBtn.height = 10;
  container.addChild(cardSelectDownBtn);

  cardSelectDownBtn.interactive = true;
  cardSelectDownBtn.on("pointerdown", () => {
    display.player.cardSelect.cardSelectIndex -= 4;
    if (display.player.cardSelect.cardSelectIndex < 0) {
      display.player.cardSelect.cardSelectIndex = 0;
    }
    updateCardSelectCards(state, display, cache);
  });

  // cond container
  const condContainer = new PIXI.Container();
  Object.assign(condContainer, { x: 5, y: 210 });
  condContainer.interactive = true;
  condContainer.on("pointerdown", () => {
    const index = display.player.cardSelect.nodeIndex!;
    if (state.player.layout.nodes[index].condMove === undefined) {
      state.player.layout.nodes[index].condMove = {
        cond: new FalseCond(),
        move: new DAb.MoveRight(),
      };
    } else {
      state.player.layout.nodes[index].condMove = undefined;
    }
    updateCondContainer(state, display);
  });
  container.addChild(condContainer);

  const condBg = new PIXI.Sprite(PIXI.Texture.WHITE);
  condBg.x = 0;
  condBg.y = 0;
  condBg.tint = 0xFF0000;
  condBg.width = 190;
  condBg.height = 190;
  condContainer.addChild(condBg);

  // create cond card display
  const condCards: CondCardDisplay[] = wrappedLayout(
    condContainer,
    i => {
      const cardContainer = new PIXI.Container();
      cardContainer.interactive = true;
      //cardContainer.on("pointerdown", () => newDirAbilitySelect(state, display, cache, i));
      cardContainer.width = 42;
      cardContainer.height = 42;

      return cardContainer;
    },
    cardContainer => {
      const bg = new PIXI.Sprite(PIXI.Texture.WHITE);
      bg.tint = 0x00AAAA;
      bg.width = 42;
      bg.height = 42;
  
      const sprite = new PIXI.Sprite();
      sprite.x = 23;
      sprite.y = 23;
      sprite.pivot.set(21, 21);
  
      cardContainer.addChild(bg);
      cardContainer.addChild(sprite);

      return { cardContainer, bg, sprite, ability: undefined };
    },
    8,
    { orientation: "horizontal", spacing: { x: 45, y: 45 }, start: { x: 5, y: 5 }, wrappingLimit: 4, },
  );

  // create cond move dir card display
  const condDirCards: DirCardDisplay[] = wrappedLayout(
    condContainer,
    i => {
      const cardContainer = new PIXI.Container();
      cardContainer.interactive = true;
      //cardContainer.on("pointerdown", () => newDirAbilitySelect(state, display, cache, i));
      cardContainer.width = 42;
      cardContainer.height = 42;

      return cardContainer;
    },
    cardContainer => {
      const bg = new PIXI.Sprite(PIXI.Texture.WHITE);
      bg.tint = 0x00AAAA;
      bg.width = 42;
      bg.height = 42;
  
      const sprite = new PIXI.Sprite();
      sprite.x = 23;
      sprite.y = 23;
      sprite.pivot.set(21, 21);
  
      cardContainer.addChild(bg);
      cardContainer.addChild(sprite);

      return { cardContainer, bg, sprite, ability: undefined };
    },
    4,
    { orientation: "horizontal", spacing: { x: 45, y: 45 }, start: { x: 5, y: 140 }, wrappingLimit: 4, },
  );

  // create dir card display
  const dirCards: DirCardDisplay[] = wrappedLayout(
    container,
    i => {
      const cardContainer = new PIXI.Container();
      cardContainer.interactive = true;
      cardContainer.on("pointerdown", () => newDirAbilitySelect(state, display, cache, i));
      cardContainer.width = 42;
      cardContainer.height = 42;

      return cardContainer;
    },
    cardContainer => {
      const bg = new PIXI.Sprite(PIXI.Texture.WHITE);
      bg.tint = 0x00AAAA;
      bg.width = 42;
      bg.height = 42;
  
      const sprite = new PIXI.Sprite();
      sprite.x = 23;
      sprite.y = 23;
      sprite.pivot.set(21, 21);
  
      cardContainer.addChild(bg);
      cardContainer.addChild(sprite);

      return { cardContainer, bg, sprite, ability: undefined };
    },
    4,
    { orientation: "horizontal", spacing: { x: 45, y: 45 }, start: { x: 10, y: 400 }, wrappingLimit: 4, },
  );

  container.visible = false;
  
  parentContainer.addChild(container);

  return {
    bg, container, condContainer, condBg,
    cards, dirCards, condCards, condDirCards, cardSelectUpBtn, cardSelectDownBtn,
    nodeIndex: undefined, cardSelectIndex: 0, condCardSelectIndex: 0,
  };
}

export function updateCardSelectCards(
  state: GameState,
  display: Display,
  cache: Cache,
) {
  const elementsUnfiltered = state.cardCrafts.map(x => {
    if (x.available === 1) {
      return x.node;
    } else {
      return undefined;
    }
  });
  const min = display.player.cardSelect.cardSelectIndex;
  const availableCards = filterUndefined(elementsUnfiltered).slice(min, min + maxCardsX * maxCardsY);
  for (let i = 0; i < maxCardsX * maxCardsY; i++) {
    const card: Ability | undefined = availableCards[i];
    if (card === undefined) {
      display.player.cardSelect.cards[i].sprite.texture = PIXI.Texture.EMPTY;
      display.player.cardSelect.cards[i].ability = undefined;
    } else {
      display.player.cardSelect.cards[i].sprite.texture = cache[nodeSprite(card)];
      display.player.cardSelect.cards[i].ability = card;
    }
  }
}

export function updateCondContainer(
  state: GameState,
  display: Display,
) {
  const index = display.player.cardSelect.nodeIndex!;
  if (state.player.layout.nodes[index].condMove === undefined) {
    display.player.cardSelect.condContainer.alpha = 0.5;
  } else {
    display.player.cardSelect.condContainer.alpha = 1;
  }
}

export function updateCondSelectCards(
  state: GameState,
  display: Display,
  cache: Cache,
) {
  const elementsUnfiltered = state.condCrafts.map(x => {
    if (x.available === 1) {
      return x.card;
    } else {
      return undefined;
    }
  });
  const min = display.player.cardSelect.condCardSelectIndex;
  const availableCards = filterUndefined(elementsUnfiltered).slice(min, min + maxCardsX * maxCardsY);
  for (let i = 0; i < 8; i++) {
    const card: CondCard | undefined = availableCards[i];
    if (card === undefined) {
      display.player.cardSelect.condCards[i].sprite.texture = PIXI.Texture.EMPTY;
      display.player.cardSelect.condCards[i].ability = undefined;
    } else {
      const value = condCardSprite(card);
      display.player.cardSelect.condCards[i].sprite.texture = cache[value];
      display.player.cardSelect.condCards[i].ability = card;
    }
  }
}

export function updateCondDirSelectCards(
  state: GameState,
  display: Display,
  cache: Cache,
) {
  const dirCards = [
    new DAb.MoveDown(),
    new DAb.MoveUp(),
    new DAb.MoveLeft(),
    new DAb.MoveRight(),
  ];
  for (let i = 0; i < 4; i++) {
    const card: DirAbility | undefined = dirCards[i];
    if (card === undefined) {
      display.player.cardSelect.condDirCards[i].sprite.texture = PIXI.Texture.EMPTY;
      display.player.cardSelect.condDirCards[i].sprite.angle = 0;
      display.player.cardSelect.condDirCards[i].ability = undefined;
    } else {
      const values = dirAbilitySprite(card);
      display.player.cardSelect.condDirCards[i].sprite.texture = cache[values.sprite];
      display.player.cardSelect.condDirCards[i].sprite.angle = values.angle;
      display.player.cardSelect.condDirCards[i].ability = card;
    }
  }
}

export function updateDirSelectCards(
  state: GameState,
  display: Display,
  cache: Cache,
) {
  const dirCards = [
    new DAb.MoveDown(),
    new DAb.MoveUp(),
    new DAb.MoveLeft(),
    new DAb.MoveRight(),
  ];
  for (let i = 0; i < 4; i++) {
    const card: DirAbility | undefined = dirCards[i];
    if (card === undefined) {
      display.player.cardSelect.dirCards[i].sprite.texture = PIXI.Texture.EMPTY;
      display.player.cardSelect.dirCards[i].sprite.angle = 0;
      display.player.cardSelect.dirCards[i].ability = undefined;
    } else {
      const values = dirAbilitySprite(card);
      display.player.cardSelect.dirCards[i].sprite.texture = cache[values.sprite];
      display.player.cardSelect.dirCards[i].sprite.angle = values.angle;
      display.player.cardSelect.dirCards[i].ability = card;
    }
  }
}

export function showCardSelect(
  state: GameState,
  display: Display,
  cache: Cache,
  nodeIndex: number,
): Anim {
  return new Seq([
    embedEff(() => {
      display.player.cardSelect.container.visible = true;
      display.player.cardSelect.nodeIndex = nodeIndex;
      updateCardSelectCards(state, display, cache);
      updateCondContainer(state, display);
      updateCondSelectCards(state, display, cache);
      updateCondDirSelectCards(state, display, cache);
      updateDirSelectCards(state, display, cache);
    }),
  ]);
}

export function newAbilitySelect(
  state: GameState,
  display: Display,
  cache: Cache,
  i: number,
) {
  const ability = display.player.cardSelect.cards[i].ability;
  if (ability !== undefined) {
    changeLayoutNode("player", state, display, display.player.cardSelect.nodeIndex!, ability, cache);
  }
}

export function newDirAbilitySelect(
  state: GameState,
  display: Display,
  cache: Cache,
  i: number,
) {
  const ability = display.player.cardSelect.dirCards[i].ability;
  if (ability !== undefined) {
    attachAnimation(changeDirNode(state, display, display.player.cardSelect.nodeIndex!, ability, cache));
  }
}