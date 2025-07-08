const MODULE_ID = 'cs-click-to-scene';
const SETTING_ID = {
  ENABLE_SCENES_LIST_JUMP: 'enableScenesListJump',
};
const SCENE_DIRECTORY_CB = 'SceneDirectory.prototype._onClickEntryName';

Hooks.once('init', () => {
  if (!game.modules.get('lib-wrapper')?.active) {
    if (game.user?.isGM) ui.notifications.error(game.i18n.localize('CS.CLICK_TO_SCENE.LibWrapperError'));
    return;
  }

  const monksSceneNavigationActive = !game.modules.get('monks-scene-navigation')?.active;
  if (monksSceneNavigationActive && game.user?.isGM) {
    ui.notifications.info(game.i18n.localize('CS.CLICK_TO_SCENE.MONKS_ACTIVE'));
  }

  registerSettings({
    [SETTING_ID.ENABLE_SCENES_LIST_JUMP]: monksSceneNavigationActive
  });

  libWrapper.register(
    MODULE_ID,
    'Scene.prototype._onClickDocumentLink',
    function (wrapped, event) {
      const id = event.target?.dataset?.id;
      const scene = game.scenes.get(id);
      if (!scene) return wrapped(event);

      handleSceneClick(event, scene);
    },
    'MIXED',
  );

  handleScenesListSettingChange(game.settings.get(MODULE_ID, SETTING_ID.ENABLE_SCENES_LIST_JUMP));
});

function handleSceneClick(event, scene) {
  if (event.ctrlKey || event.metaKey) {
    return scene.activate();
  }

  if (event.altKey) {
    return scene.sheet.render(true);
  }

  return scene.view();
}

function handleScenesListSettingChange(enabled) {
  if (enabled) {
    libWrapper.register(
      MODULE_ID,
      SCENE_DIRECTORY_CB,
      (wrapped, event) => {
        const id = event.currentTarget?.parentElement?.dataset?.documentId;
        const scene = game.scenes.get(id);
        if (!scene) return wrapped(event);
        handleSceneClick(event, scene);
      },
      'MIXED',
    );
  } else {
    libWrapper.unregister(MODULE_ID, SCENE_DIRECTORY_CB);
  }
}

function registerSettings(options) {
  game.settings.register(MODULE_ID, SETTING_ID.ENABLE_SCENES_LIST_JUMP, {
    name: game.i18n.localize('CS.CLICK_TO_SCENE.SETTINGS.EnableScenesList.Name'),
    hint: game.i18n.localize('CS.CLICK_TO_SCENE.SETTINGS.EnableScenesList.Hint'),
    scope: 'world',
    config: true,
    type: Boolean,
    default: options[SETTING_ID.ENABLE_SCENES_LIST_JUMP],
    onChange: enabled => handleScenesListSettingChange(enabled),
  });
}

