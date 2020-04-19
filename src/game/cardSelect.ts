import { GameState } from "./state";
import { Display } from "./display";
import { Cache, attachAnimation } from "../app/main";
import { Par, Seq, embedEff, TweenTo, Anim, TweenFromTo, mkAccessTarget } from "../app/animation";
import { filterUndefined, fillUndefinedUpTo } from "../util/util";
import { Ability } from "./definitions/ability";
import { nodeSprite } from "./ability";
import { changeLayoutNode, changeDirNode } from "./layout";
import { DirAbility } from "./definitions/dirAbility";
import { dirAbilitySprite } from "./dirAbility";

const maxCardsX = 4;
const maxCardsY = 4;

export type CardDisplay = {
  cardContainer: PIXI.Container,
  bg: PIXI.Sprite,
  sprite: PIXI.Sprite,
  ability: Ability | undefined,
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
  dirCards: DirCardDisplay[],
  nodeIndex: number | undefined,
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
  bg.height = 400;
  container.addChild(bg);

  bg.interactive = true;
  bg.on("pointerdown", () => container.visible = false);

  // create card display
  const cards: CardDisplay[] = [];
  for (let i = 0; i < maxCardsX * maxCardsY; i++) {
    const row = Math.floor(i / maxCardsX);
    const col = Math.floor(i % maxCardsX);
    const cardContainer = new PIXI.Container();
    cardContainer.interactive = true;
    cardContainer.on("pointerdown", () => newAbilitySelect(state, display, cache, i));
    cardContainer.width = 42;
    cardContainer.height = 42;

    const bg = new PIXI.Sprite(PIXI.Texture.WHITE);
    bg.tint = 0x00AAAA;
    bg.x = col * 45 + 10;
    bg.y = row * 45 + 10;
    bg.width = 42;
    bg.height = 42;

    const sprite = new PIXI.Sprite();
    sprite.x = col * 45 + 12 + 21;
    sprite.y = row * 45 + 12 + 21;
    sprite.pivot.set(21, 21);

    cardContainer.addChild(bg);
    cardContainer.addChild(sprite);
    container.addChild(cardContainer);

    cards.push({ cardContainer, bg, sprite, ability: undefined });
  }

  // create dir card display
  const dirCards: DirCardDisplay[] = [];
  for (let i = 0; i < maxCardsX * maxCardsY; i++) {
    const row = Math.floor(i / maxCardsX);
    const col = Math.floor(i % maxCardsX);
    const cardContainer = new PIXI.Container();
    cardContainer.interactive = true;
    cardContainer.on("pointerdown", () => newDirAbilitySelect(state, display, cache, i));
    cardContainer.width = 42;
    cardContainer.height = 42;

    const bg = new PIXI.Sprite(PIXI.Texture.WHITE);
    bg.tint = 0x00AAAA;
    bg.x = col * 45 + 10;
    bg.y = row * 45 + 210;
    bg.width = 42;
    bg.height = 42;

    const sprite = new PIXI.Sprite();
    sprite.x = col * 45 + 12 + 21;
    sprite.y = row * 45 + 212 + 21;
    sprite.pivot.set(21, 21);

    cardContainer.addChild(bg);
    cardContainer.addChild(sprite);
    container.addChild(cardContainer);

    dirCards.push({ cardContainer, bg, sprite, ability: undefined });
  }

  container.visible = false;
  
  parentContainer.addChild(container);

  return { bg, container, cards, dirCards, nodeIndex: undefined };
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
  const availableCards = filterUndefined(elementsUnfiltered).slice(0, maxCardsX * maxCardsY);
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

export function updateDirSelectCards(
  state: GameState,
  display: Display,
  cache: Cache,
) {
  const elementsUnfiltered = state.dirCrafts.map(x => {
    if (x.available === 1) {
      return x.node;
    } else {
      return undefined;
    }
  });
  const availableCards = filterUndefined(elementsUnfiltered).slice(0, maxCardsX * maxCardsY);
  for (let i = 0; i < maxCardsX * maxCardsY; i++) {
    const card: DirAbility | undefined = availableCards[i];
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