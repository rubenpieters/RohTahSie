import { CardCrafts } from "./all";
import { nodeSprite } from "../game/state";
import { Cache } from "../app/main";

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
  cache: Cache,
): CardCraftDisplay {
  const container = new PIXI.Container();
  Object.assign(container, { x: 0, y: 130 });

  // initialize icons
  let cards: CardDisplay[] = [];
  let i = 0;
  cardCrafts.forEach(card => {
    const cardContainer = new PIXI.Container();
    cardContainer.interactive = true;
    cardContainer.on("pointerdown", () => console.log("test"));
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
    i += 1;
  });

  parentContainer.addChild(container);

  return { container, cards };
}