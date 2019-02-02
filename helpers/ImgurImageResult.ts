export class ImgurImageResult {
  public id: string;
  public title: string;
  public originalUrl: string;

  constructor(data?: any) {
    if (data) {
      this.title = ((data.title) ? data.title : data.description) as string;
      this.id = data.id as string;
      if (data.type === 'video/mp4' || data.type === 'image/gif') {
        this.originalUrl = `https://i.imgur.com/${data.id}.gif` as string;
      } else {
        this.originalUrl = data.link as string;
      }
    }
  }
}
