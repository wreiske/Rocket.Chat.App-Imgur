import { ISlashCommandPreviewItem, SlashCommandPreviewItemType } from '@rocket.chat/apps-engine/definition/slashcommands';

export class ImgurResult {
    public id: string;
    public title: string;
    public previewUrl: string;

    // Returns data we care about from the imgur endpoint
    // TODO: Allow large gif previews to be resized in the preview...
    constructor(data?: any) {
        if (data && data.post) {
            this.title = data.post.title as string;
            if (data.post.is_album) {
                this.id = data.post.images[0].id as string;
                this.previewUrl = `https://i.imgur.com/${data.post.images[0].id}b.jpg` as string;
            } else {
                this.id = data.post.id as string;
                this.previewUrl = `https://i.imgur.com/${data.post.id}b.jpg` as string;
            }
        }
    }

    public toPreviewItem(): ISlashCommandPreviewItem {
        if (!this.id || !this.previewUrl) {
            throw new Error('Invalid result');
        }
        return {
            id: this.id,
            type: SlashCommandPreviewItemType.IMAGE,
            value: this.previewUrl,
        };
    }
}
