import { CardCrafts } from "./all";
import { nodeSprite } from "../game/state";
import { Cache } from "../app/main";
import { Display } from "src/game/display";

export type CardDisplay = {
  cardContainer: PIXI.Container,
  bg: PIXI.Sprite,
  sprite: PIXI.Sprite,
}

export type CardCraftDisplay = {
  container: PIXI.Container,
  cards: CardDisplay[],
}

export function initializeCraftCards(
  parentContainer: PIXI.Container,
  cardCrafts: CardCrafts,
  display: Display,
  cache: Cache,
): CardCraftDisplay {
  const container = new PIXI.Container();
  Object.assign(container, { x: 0, y: 130 });

  // initialize icons
  let cards: CardDisplay[] = [];
  for (let i = 0; i < cardCrafts.length; i++) {
    const card = cardCrafts[i];
    const cardContainer = new PIXI.Container();
    cardContainer.interactive = true;
    cardContainer.on("pointerdown", changeCardIncluded(i, cardCrafts, display));
    cardContainer.width = 60;
    cardContainer.height = 75;

    const sprite = new PIXI.Sprite(cache[nodeSprite(card.node)]);
    sprite.x = i * 60 + 50;

    const bg = new PIXI.Sprite(PIXI.Texture.WHITE);
    bg.tint = 0x00AAAA;
    bg.x = i * 60 + 45;
    bg.width = 50;
    bg.height = 75;

    cardContainer.addChild(bg);
    cardContainer.addChild(sprite);
    container.addChild(cardContainer);
    cards.push({ cardContainer, bg, sprite });
  }

  updateCardIncluded(cardCrafts, cards);

  parentContainer.addChild(container);

  return { container, cards };
}

function updateCardIncluded(
  cardCrafts: CardCrafts,
  cardsDisplay: CardDisplay[],
) {
  for (let i = 0; i < cardCrafts.length; i++) {
    const card = cardCrafts[i];
    const currentIncluded = card.included;
    if (currentIncluded === 0) {
      cardsDisplay[i].bg.tint = 0x00AAAA;
    } else {
      cardsDisplay[i].bg.tint = 0x00CC11;
    }
  }
}

function changeCardIncluded(
  i: number,
  cardCrafts: CardCrafts,
  display: Display,
): () => void {
  return () => {
    const currentIncluded = cardCrafts[i].included;
    if (currentIncluded === 0) {
      cardCrafts[i].included = 1;
      display.cardCraft.cards[i].bg.tint = 0x00CC11;
    } else {
      cardCrafts[i].included = 0;
      display.cardCraft.cards[i].bg.tint = 0x00AAAA;
    }
  }
}