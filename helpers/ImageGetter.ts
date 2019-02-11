import { HttpStatusCode, IHttp, ILogger, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ImgurResult } from './ImgurResult';
import { ImgurImageResult } from './ImgurImageResult';

export class ImageGetter {
    private readonly defaultKey = '9f75b03f6156b08';
    public async search(logger: ILogger, http: IHttp, phase: string, read: IRead): Promise<Array<ImgurResult>> {
        let search = phase.trim();
        if (!search) {
            search = 'random';
        }
        const key = await read.getEnvironmentReader().getSettings().getValueById('imgur_client_id') || this.defaultKey;

        // There is no way to limit the number of responses currently from the Imgur API
        // See https://apidocs.imgur.com/#paging-results
        // "NOTE: /gallery endpoints do not support the perPage query string, and /album/{id}/images is not paged."

        const response = await http.get(`https://api.imgur.com/3/search/?q=${search}`, {
            headers: {
                'Authorization': `Client-ID ${key}`
            }
        });

        if (response.statusCode === HttpStatusCode.OK && response.headers != null) {
            logger.debug(`Imgur Client Rate Limit Remaining: ${response.headers['x-ratelimit-clientremaining']}`);
            logger.debug(`Imgur User Rate Limit Remaining: ${response.headers['x-ratelimit-userremaining']}`);

            if (response.headers['x-ratelimit-userremaining'] === "0") {
                logger.debug('User remaining rate limit exceeded', response);
                throw new Error('User remaining rate limit exceeded.');
            }
            if (response.headers['x-ratelimit-clientremaining'] === "0") {
                logger.debug('Client remaining rate limit exceeded.', response);
                throw new Error('Client remaining rate limit exceeded.');
            }
        }

        if (response.statusCode !== HttpStatusCode.OK || !response.data || !response.data.data || !response.data.data.items) {
            logger.debug('Did not get a valid response', response);
            throw new Error('Unable to retrieve images.');
        } else if (!Array.isArray(response.data.data.items)) {
            logger.debug('The response data is not an Array:', response.data.data);
            throw new Error('Data is in a format we don\'t understand.');
        }

        let images = Array();
        response.data.data.items.forEach(element => {
            element.items.forEach(image => {
                if (image.type === "post") {
                    images.push(image);
                }
            });
        });
        logger.debug('We got this many results: ', images.length);
        return images.map((r) => new ImgurResult(r));
    }

    public async getOne(logger: ILogger, http: IHttp, imageId: string, read: IRead): Promise<ImgurImageResult> {
        const key = await read.getEnvironmentReader().getSettings().getValueById('imgur_client_id')  || this.defaultKey;
        const response = await http.get(`https://api.imgur.com/3/image/${imageId}`, {
            headers: {
                'Authorization': `Client-ID ${key}`
            }
        });
        logger.debug('LE RESPONSE', response);
        if (response.statusCode !== HttpStatusCode.OK || !response.data || !response.data.data) {
            logger.debug('Did not get a valid response', response);
            throw new Error('Unable to retrieve the image.');
        } else if (typeof response.data.data !== 'object') {
            logger.debug('The response data is not an Object:', response.data.data);
            throw new Error('Data is in a format we don\'t understand.');
        }

        logger.debug('The returned data:', response.data.data);
        return new ImgurImageResult(response.data.data);
    }
}
