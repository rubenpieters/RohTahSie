import { CardCrafts } from "./all";
import { GameState } from "../game/state";
import { Cache, attachExplWindowAnimation, clearExplWindowAnimation } from "../app/main";
import { Display } from "../game/display";
import { loadNodeExpl } from "../game/nodeExpl";
import { nodeSprite } from "../game/ability";
import { wrappedLayout } from "../layout/layout";

const maxCardX = 8;

export type CardDisplay = {
  cardContainer: PIXI.Container,
  bg: PIXI.Sprite,
  sprite: PIXI.Sprite,
  addBtn: PIXI.Sprite,
}

export type CardCraftDisplay = {
  container: PIXI.Container,
  cards: CardDisplay[],
  gemText: PIXI.BitmapText,
}

export function initializeCraftCards(
  parentContainer: PIXI.Container,
  cardCrafts: CardCrafts,
  state: GameState,
  display: Display,
  cache: Cache,
): CardCraftDisplay {
  const container = new PIXI.Container();
  Object.assign(container, { x: 0, y: 80 });

  // initialize icons
  const cards: CardDisplay[] = wrappedLayout(
    container,
    i => {
      const cardContainer = new PIXI.Container();
      cardContainer.width = 60;
      cardContainer.height = 75;
      
      return cardContainer;
    },
    (cardContainer, i) => {
      const card = cardCrafts[i];
      const sprite = new PIXI.Sprite(cache[nodeSprite(card.node)]);
      sprite.x = 5;
      sprite.y = 5;
  
      const bg = new PIXI.Sprite(PIXI.Texture.WHITE);
      bg.tint = 0x00AAAA;
      bg.width = 50;
      bg.height = 75;
  
      const addBtn = new PIXI.Sprite(PIXI.Texture.WHITE);
      addBtn.tint = 0x00000000;
      addBtn.y = 80;
      addBtn.width = 50;
      addBtn.height = 10;
  
      sprite.interactive = true;
      sprite.on("pointerup", craftPointerUpCb(i, cardCrafts, display));
      sprite.on("pointerdown", craftPointerDownCb(i, cardCrafts, display));
  
      addBtn.interactive = true;
      addBtn.on("pointerdown", addCard(i, state, display));
  
      cardContainer.addChild(bg);
      cardContainer.addChild(sprite);
      cardContainer.addChild(addBtn);
      return { cardContainer, bg, sprite, addBtn };
    },
    cardCrafts.length,
    { orientation: "horizontal", spacing: { x: 60, y: 100 }, start: { x: 45, y: 50 }, wrappingLimit: maxCardX, },
  );

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

function craftPointerUpCb(
  i: number,
  cardCrafts: CardCrafts,
  display: Display,
): () => void {
  return () => {
    clearExplWindowAnimation();
    // if node expl container is not visible: do click action
    if (! display.player.nodeExpl.container.visible) {
      const currentIncluded = cardCrafts[i].included;
      const currentAvailable = cardCrafts[i].available;
      if (currentAvailable <= 0) {
        // TODO: animation
        console.log("card not available");
      } else {
        if (currentIncluded === 0) {
          cardCrafts[i].included = 1;
          display.cardCraft.cards[i].bg.tint = 0x00CC11;
        } else {
          cardCrafts[i].included = 0;
          display.cardCraft.cards[i].bg.tint = 0x00AAAA;
        }
      }
    }
    // if loading sprite is visible: cancel loading
    else if (display.player.nodeExpl.loading.visible) {
      display.player.nodeExpl.container.visible = false;
    }
  };
}

function craftPointerDownCb(
  i: number,
  cardCrafts: CardCrafts,
  display: Display,
) {
  return () => {
    display.player.nodeExpl.container.visible = false;
    display.player.nodeExpl.loading.visible = false;
    const anim = loadNodeExpl(cardCrafts[i].node, display.player.nodeExpl);
    attachExplWindowAnimation(anim);
  };
}

function addCard(
  i: number,
  state: GameState,
  display: Display,
): () => void {
  return () => {
    const currentGems = state.gems;
    const cost = state.cardCrafts[i].cost;
    if (cost > currentGems) {
      // TODO: animation
      console.log("not enough gems");
    } else {
      state.gems -= cost;
      updateGemText(display.cardCraft.gemText, state);
      state.cardCrafts[i].available += 1;
    }
  };
}

export function updateGemText(
  text: PIXI.BitmapText,
  state: GameState,
) {
  text.text = `${state.gems}`;
}