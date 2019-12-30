import { CardCrafts } from "./all";
import { nodeSprite, GameState } from "../game/state";
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
  gemText: PIXI.BitmapText,
}

export function initializeCraftCards(
  parentContainer: PIXI.Container,
  cardCrafts: CardCrafts,
  display: Display,
  cache: Cache,
): CardCraftDisplay {
  const container = new PIXI.Container();
  Object.assign(container, { x: 0, y: 80 });

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
    sprite.y = 50;

    const bg = new PIXI.Sprite(PIXI.Texture.WHITE);
    bg.tint = 0x00AAAA;
    bg.x = i * 60 + 45;
    bg.y = 50;
    bg.width = 50;
    bg.height = 75;

    cardContainer.addChild(bg);
    cardContainer.addChild(sprite);
    container.addChild(cardContainer);
    cards.push({ cardContainer, bg, sprite });
  }

  // initialize gem counter
  const gemSprite = new PIXI.Sprite(cache["gem"]);
  gemSprite.x = 55;
  container.addChild(gemSprite);

  const gemText = new PIXI.BitmapText("0", {
    font: {
      name: "Bahnschrift",
      size: 28,
    },
    align: "center",
    tint: 0x000000,
  });
  gemText.x = 95;
  container.addChild(gemText);

  updateCardIncluded(cardCrafts, cards);

  parentContainer.addChild(container);

  return { container, cards, gemText };
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

export function updateGemText(
  text: PIXI.BitmapText,
  state: GameState,
) {
  text.text = `${state.gems}`;
}