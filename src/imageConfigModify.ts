import path from "path";
import fs from "fs";
import * as FileType from "file-type";
import { ProjectPath } from "./main";

export class ImageConfigModify {
	private changeConfig: { [key: string]: any } = {};
	private configPath: { [key: string]: string[] } = {
		fixAlphaTransparencyArtifacts: ["userData"],
	};
	public fixAlphaTransparency(isFix: boolean) {
		const assetsPath = path.join(ProjectPath, "assets");
		this.changeConfig = {
			fixAlphaTransparencyArtifacts: isFix,
		};
		this.traverseDir(assetsPath);
	}

	traverseDir(filePath: string) {
		const files = fs.readdirSync(filePath);
		files.forEach(fileName => {
			let fileDir = path.join(filePath, fileName);
			const stat = fs.statSync(fileDir);
			if (stat.isDirectory()) {
				this.traverseDir(fileDir);
			}
			if (stat.isFile()) {
				this.isImageFile(fileDir).then(isImage => {
					isImage && this.changeImageConfig(fileDir);
				});
			}
		});
	}

	changeImageConfig(imagePath: string) {
		const config = this.changeConfig;
		const metaPath = imagePath + ".meta";

		if (fs.existsSync(metaPath)) {
			const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
			for (let conf in config) {
				console.log(conf);

				let metaVal = meta[this.configPath[conf][0]]; // todo: 需要优化属性查找方式
				if (metaVal) {
					metaVal[conf] = config[conf];
				}
				console.log(`修改${conf}为${config[conf].toString()}...`);
			}

			fs.writeFileSync(metaPath, JSON.stringify(meta));
		} else {
			console.warn(`No meta file found for ${imagePath}`);
		}
	}

	async isImageFile(filePath: string) {
		return FileType.fromFile(filePath).then(res => {
			return res?.mime.startsWith("image");
		});
	}
}

export const imageConfigModify = new ImageConfigModify();
