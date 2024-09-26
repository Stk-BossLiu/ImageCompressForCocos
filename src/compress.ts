import imagemin from "imagemin";
import imageminJpegtran from "imagemin-jpegtran";
import imageminPngquant from "imagemin-pngquant";
import globby from "globby";
import fs from "fs";
import path from "path";

class CompressImage {
	compressImageList(imageList: string[]) {
		imageList.forEach(uuid => {
			Editor.Message.request("asset-db", "query-url", uuid).then(
				(url: string | null) => {
					if (!url) return;
					const urlList = url.split("/");
					const relativePath = urlList.slice(2).join("/");
					const imagePath = path.join(Editor.Project.path + "/", relativePath);
					url && this.imageMinWork(imagePath);
				}
			);
		});
	}

	async compressImageFromFolder(folderPath: string) {
		folderPath = path.resolve(folderPath, "*.{jpg,png}").replace(/\\/g, "/");
		const inputPaths = await globby(folderPath, { onlyFiles: true });
		if (inputPaths.length == 0) {
			Editor.Dialog.warn("文件夹没有jpg/png。");
			return;
		}
		imagemin(inputPaths, {
			glob: false,
			plugins: [
				imageminJpegtran(),
				imageminPngquant({
					quality: [0.6, 0.8],
				}),
			],
		}).then(files => {
			files.forEach(async file => {
				fs.writeFile(file.sourcePath, file.data, () => {
					console.log(file.sourcePath + " 压缩完成");
				});
			});
		});
	}

	private async imageMinWork(imagePath: string) {
		const buffer = await fs.readFileSync(imagePath);
		// console.log(buffer);
		const compressBuffer = await imagemin.buffer(buffer, {
			plugins: [
				imageminJpegtran(),
				imageminPngquant({
					quality: [0.6, 0.8], // between 0 and 1
				}),
			],
		});
		await fs.writeFileSync(imagePath, compressBuffer);
	}
}

export const compressImage = new CompressImage();
