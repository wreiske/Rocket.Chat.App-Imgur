import {
    IConfigurationExtend,
    IEnvironmentRead,
    ILogger,
} from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { SettingType } from '@rocket.chat/apps-engine/definition/settings';

import { ImgurCommand } from './commands/ImgurCommand';
import { ImageGetter } from './helpers/ImageGetter';

export class ImgurApp extends App {
    private imageGetter: ImageGetter;

    constructor(info: IAppInfo, logger: ILogger) {
        super(info, logger);

        this.imageGetter = new ImageGetter();
    }

    public getImageGetter(): ImageGetter {
        return this.imageGetter;
    }

    protected async extendConfiguration(configuration: IConfigurationExtend, environmentRead: IEnvironmentRead): Promise<void> {
        await configuration.settings.provideSetting({
            id: 'imgur_client_id',
            type: SettingType.STRING,
            packageValue: '',
            required: true,
            public: false,
            i18nLabel: 'Customize_Imgur_ClientId',
            i18nDescription: 'Customize_Imgur_ClientId_Description',
        });
        await configuration.settings.provideSetting({
            id: 'imgur_show_title',
            type: SettingType.BOOLEAN,
            packageValue: true,
            required: true,
            public: false,
            i18nLabel: 'Customize_Imgur_Show_Title',
            i18nDescription: 'Customize_Imgur_Show_Title_Description',
        });
        await configuration.slashCommands.provideSlashCommand(new ImgurCommand(this));
    }
}