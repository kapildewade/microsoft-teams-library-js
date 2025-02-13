import { ensureInitialized, isAPISupportedByPlatform } from '../internal/internalAPIs';
import { FrameContexts, HostClientType } from '../public/constants';
import {
  ChatMembersInformation,
  ShowNotificationParameters,
  FilePreviewParameters,
  TeamInstanceParameters,
  UserJoinedTeamsInformation,
  UserSettingTypes,
} from './interfaces';
import { getGenericOnCompleteHandler } from '../internal/utils';
import { Communication, sendMessageToParent, sendMessageEventToChild } from '../internal/communication';
import { menus } from './menus';
import { registerHandler } from '../internal/handlers';
import { GlobalVars } from '../internal/globalVars';
import { ErrorCode, SdkError } from '../public/interfaces';
import { getUserJoinedTeamsSupportedAndroidClientVersion } from '../internal/constants';

export function initializePrivateApis(): void {
  menus.initialize();
}

/**
 * @private
 * Hide from docs
 * ------
 * Allows an app to retrieve information of all user joined teams
 * @param callback The callback to invoke when the {@link TeamInstanceParameters} object is retrieved.
 * @param teamInstanceParameters OPTIONAL Flags that specify whether to scope call to favorite teams
 */
export function getUserJoinedTeams(
  callback: (userJoinedTeamsInformation: UserJoinedTeamsInformation) => void,
  teamInstanceParameters?: TeamInstanceParameters,
): void {
  ensureInitialized();

  if (
    (GlobalVars.hostClientType === HostClientType.android ||
      GlobalVars.hostClientType === HostClientType.teamsRoomsAndroid ||
      GlobalVars.hostClientType === HostClientType.teamsPhones ||
      GlobalVars.hostClientType === HostClientType.teamsDisplays) &&
    !isAPISupportedByPlatform(getUserJoinedTeamsSupportedAndroidClientVersion)
  ) {
    const oldPlatformError: SdkError = { errorCode: ErrorCode.OLD_PLATFORM };
    throw new Error(JSON.stringify(oldPlatformError));
  }

  sendMessageToParent('getUserJoinedTeams', [teamInstanceParameters], callback);
}

/**
 * @private
 * Hide from docs
 * ------
 * Place the tab into full-screen mode.
 */
export function enterFullscreen(): void {
  ensureInitialized(FrameContexts.content);
  sendMessageToParent('enterFullscreen', []);
}

/**
 * @private
 * Hide from docs
 * ------
 * Reverts the tab into normal-screen mode.
 */
export function exitFullscreen(): void {
  ensureInitialized(FrameContexts.content);
  sendMessageToParent('exitFullscreen', []);
}

/**
 * @private
 * Hide from docs.
 * ------
 * Opens a client-friendly preview of the specified file.
 * @param file The file to preview.
 */
export function openFilePreview(filePreviewParameters: FilePreviewParameters): void {
  ensureInitialized(FrameContexts.content);

  const params = [
    filePreviewParameters.entityId,
    filePreviewParameters.title,
    filePreviewParameters.description,
    filePreviewParameters.type,
    filePreviewParameters.objectUrl,
    filePreviewParameters.downloadUrl,
    filePreviewParameters.webPreviewUrl,
    filePreviewParameters.webEditUrl,
    filePreviewParameters.baseUrl,
    filePreviewParameters.editFile,
    filePreviewParameters.subEntityId,
    filePreviewParameters.viewerAction,
    filePreviewParameters.fileOpenPreference,
  ];

  sendMessageToParent('openFilePreview', params);
}

/**
 * @private
 * Hide from docs.
 * ------
 * display notification API.
 * @param message Notification message.
 * @param notificationType Notification type
 */
export function showNotification(showNotificationParameters: ShowNotificationParameters): void {
  ensureInitialized(FrameContexts.content);
  const params = [showNotificationParameters.message, showNotificationParameters.notificationType];
  sendMessageToParent('showNotification', params);
}

/**
 * @private
 * Hide from docs.
 * ------
 * Upload a custom App manifest directly to both team and personal scopes.
 * This method works just for the first party Apps.
 */
export function uploadCustomApp(manifestBlob: Blob, onComplete?: (status: boolean, reason?: string) => void): void {
  ensureInitialized();

  sendMessageToParent('uploadCustomApp', [manifestBlob], onComplete ? onComplete : getGenericOnCompleteHandler());
}

/**
 * @private
 * Internal use only
 * Sends a custom action MessageRequest to Teams or parent window
 * @param actionName Specifies name of the custom action to be sent
 * @param args Specifies additional arguments passed to the action
 * @param callback Optionally specify a callback to receive response parameters from the parent
 * @returns id of sent message
 */
export function sendCustomMessage(
  actionName: string,
  // tslint:disable-next-line:no-any
  args?: any[],
  // tslint:disable-next-line:no-any
  callback?: (...args: any[]) => void,
): void {
  ensureInitialized();

  sendMessageToParent(actionName, args, callback);
}

/**
 * @private
 * Internal use only
 * Sends a custom action MessageEvent to a child iframe/window, only if you are not using auth popup.
 * Otherwise it will go to the auth popup (which becomes the child)
 * @param actionName Specifies name of the custom action to be sent
 * @param args Specifies additional arguments passed to the action
 * @returns id of sent message
 */
export function sendCustomEvent(
  actionName: string,
  // tslint:disable-next-line:no-any
  args?: any[],
): void {
  ensureInitialized();

  //validate childWindow
  if (!Communication.childWindow) {
    throw new Error('The child window has not yet been initialized or is not present');
  }
  sendMessageEventToChild(actionName, args);
}

/**
 * @private
 * Internal use only
 * Adds a handler for an action sent by a child window or parent window
 * @param actionName Specifies name of the action message to handle
 * @param customHandler The callback to invoke when the action message is received. The return value is sent to the child
 */
export function registerCustomHandler(
  actionName: string,
  customHandler: (
    // tslint:disable-next-line:no-any
    ...args: any[]
  ) => any[],
): void {
  ensureInitialized();
  registerHandler(actionName, (...args: any[]) => {
    return customHandler.apply(this, args);
  });
}

/**
 * @private
 * Hide from docs
 * ------
 * Allows an app to retrieve information of all chat members
 * Because a malicious party run your content in a browser, this value should
 * be used only as a hint as to who the members are and never as proof of membership.
 * @param callback The callback to invoke when the {@link ChatMembersInformation} object is retrieved.
 */
export function getChatMembers(callback: (chatMembersInformation: ChatMembersInformation) => void): void {
  ensureInitialized();

  sendMessageToParent('getChatMembers', callback);
}

/**
 * @private
 * Hide from docs
 * ------
 * Allows an app to get the configuration setting value
 * @param callback The callback to invoke when the value is retrieved.
 * @param key The key for the config setting
 */
export function getConfigSetting(callback: (value: string) => void, key: string): void {
  ensureInitialized();

  sendMessageToParent('getConfigSetting', [key], callback);
}

/**
 * @private
 * register a handler to be called when a user setting changes. The changed setting type & value is provided in the callback.
 * @param settingTypes List of user setting changes to subscribe
 * @param handler When a subscribed setting is updated this handler is called
 */
export function registerUserSettingsChangeHandler(
  settingTypes: UserSettingTypes[],
  handler: (settingType: UserSettingTypes, value: any) => void,
): void {
  ensureInitialized();

  registerHandler('userSettingsChange', handler, true, [settingTypes]);
}
