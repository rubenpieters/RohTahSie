import { Cache } from "src/app/main";
import { MenuState, GameState } from "src/game/state";
import { Display } from "src/game/display";

export type MenuType = "combat" | "map" | "craft" | "settings";

export type MenuDisplay = {
  container: PIXI.Container,
  iconSprites: PIXI.Sprite[],
}

export function initializeMenu(
  parentContainer: PIXI.Container,
  cache: Cache,
  display: Display,
  state: GameState,
): MenuDisplay {
  const container = new PIXI.Container();
  Object.assign(container, { x: 0, y: 130 });

  // initialize icons
  let iconSprites: PIXI.Sprite[] = [];
  for (let i = 0; i < 4; i++) {
    const iconName = i === 0 ?
      "combat" : i === 1 ?
      "map" : i === 2 ?
      "craft" : "settings";
    // @ts-ignore
    const iconSprite = new PIXI.Sprite(cache["menu_" + iconName]);
    iconSprite.y = i * 70;
    iconSprite.alpha = 0.35;

    iconSprite.interactive = true;
    iconSprite.on("pointerdown", transitionScreen(iconName, display, state));

    iconSprites.push(iconSprite);
    container.addChild(iconSprite);
  }

  updateMenuSelected(state.menuState, iconSprites);

  parentContainer.addChild(container);

  return { container, iconSprites };
}

function updateMenuSelected(
  menuState: MenuState,
  iconSprites: PIXI.Sprite[],
) {
  for (let i = 0; i < 4; i++) {
    if (i === 0 && menuState.menuSelected === "combat") {
      iconSprites[i].alpha = 1;
    } else if (i === 1 && menuState.menuSelected === "map") {
      iconSprites[i].alpha = 1;
    } else if (i === 2 && menuState.menuSelected === "craft") {
        iconSprites[i].alpha = 1;
    } else if (i === 3 && menuState.menuSelected === "settings") {
        iconSprites[i].alpha = 1;
    } else {
      iconSprites[i].alpha = 0.35;
    }
  }
}

function transitionScreen(
  to: MenuType,
  display: Display,
  state: GameState,
): () => void {
  return () => {
    display.combatContainer.visible = false;
    display.craftContainer.visible = false;
    switch (to) {
      case "combat": {
        display.combatContainer.visible = true;
        state.menuState.menuSelected = "combat";
        break;
      }
      case "map": {
        state.menuState.menuSelected = "map";
        break;
      }
      case "craft": {
        display.craftContainer.visible = true;
        state.menuState.menuSelected = "craft";
        break;
      }
      case "settings": {
        state.menuState.menuSelected = "settings";
        break;
      }
    }
    state.player.hotbar.elements.forEach(x => x.selected = false);
    display.player.hotbar.elements.forEach(x => x.scale.set(1, 1));
    updateMenuSelected(state.menuState, display.menu.iconSprites);
  };
}