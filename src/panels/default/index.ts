import { readFileSync } from "fs-extra";
import { join } from "path";
import { methods } from "../../main";
import { compressImage } from "../../compress";
/**
 * @zh 如果希望兼容 3.3 之前的版本可以使用下方的代码
 * @en You can add the code below if you want compatibility with versions prior to 3.3
 */
// Editor.Panel.define = Editor.Panel.define || function(options: any) { return options }
const editorElementDict = {
	ui_asset: `<ui-asset droppable="cc.ImageAsset"></ui-asset>`,
	ui_del_button: `<ui-button><ui-icon color value="del" style="font-size: 12px;"></ui-icon></ui-button>`,
};
var imageBlockList: Node[] = [];
var imageUUIDList: string[] = [];
var folderPath: string = "";
const imageBlockElementText = `<div id="image-block">
	${editorElementDict.ui_asset}
	${editorElementDict.ui_del_button}
</div>`;
module.exports = Editor.Panel.define({
	listeners: {
		show() {
			console.log("show");
		},
		hide() {
			console.log("hide");
		},
	},
	template: readFileSync(
		join(__dirname, "../../../static/template/default/index.html"),
		"utf-8"
	),
	style: readFileSync(
		join(__dirname, "../../../static/style/default/index.css"),
		"utf-8"
	),
	$: {
		app: "#app",
		imageList: "#image-list",
		addImageBtn: "#btn-add-image",
		imageSubmitBtn: "#btn-image-submit",
		folderSubmitBtn: "#btn-folder-submit",
		folderPlaceholder: "#folder",
	},

	methods: {
		init() {
			if (this.$.addImageBtn) {
				this.$.addImageBtn.innerText = Editor.I18n.t(
					"image_compress.image_compress_window.add_image"
				);
				this.$.addImageBtn.addEventListener(
					"click",
					this.addImageBlock.bind(this)
				);
			}
			if (this.$.imageSubmitBtn) {
				this.$.imageSubmitBtn.innerText = Editor.I18n.t(
					"image_compress.image_compress_window.submit"
				);
				this.$.imageSubmitBtn.addEventListener(
					"click",
					this.onSubmitImage.bind(this)
				);
			}
			console.log(this.$.folderSubmitBtn);
			if (this.$.folderSubmitBtn) {
				this.$.folderSubmitBtn.innerText = Editor.I18n.t(
					"image_compress.image_compress_window.submit"
				);
				this.$.folderSubmitBtn.addEventListener(
					"click",
					this.onSubmitFolder.bind(this)
				);
			}
			if (this.$.folderPlaceholder) {
				this.$.folderPlaceholder.addEventListener("confirm", event => {
					//@ts-ignore
					folderPath = event.target.value;
				});
			}
		},

		addImageBlock() {
			const imageBlockElement = document.createElement("div");
			this.$.imageList?.appendChild(imageBlockElement);
			imageBlockElement.innerHTML = imageBlockElementText;
			imageBlockList.push(imageBlockElement);
			const delButton = imageBlockElement.querySelector("ui-button")!;
			delButton.addEventListener("click", () => {
				imageBlockElement.remove();
				let idx = imageBlockList.indexOf(imageBlockElement);
				imageBlockList.splice(idx, 1);
				imageUUIDList.splice(idx, 1);
			});
			const asset = imageBlockElement.querySelector("ui-asset")!;
			asset.addEventListener("confirm", (event: any) => {
				console.log("Add Image:" + event.target.value);
				imageUUIDList.push(event.target.value);
			});
		},
		onSubmitImage() {
			if (imageUUIDList.length > 0) {
				compressImage.compressImageList(imageUUIDList);
				this.removeAllChildren(this.$.imageList!);
				imageUUIDList = [];
				imageBlockList = [];
			} else {
				console.log("No Image Selected");
				Editor.Dialog.warn("图片列表为空。");
			}
		},

		onSubmitFolder() {
			if (folderPath.length > 0) {
				compressImage.compressImageFromFolder(folderPath);
			} else {
				console.log("No Folder Selected");
				Editor.Dialog.warn("文件夹路径为空。");
			}
		},

		removeAllChildren(elem: Node) {
			while (elem.hasChildNodes()) {
				elem.removeChild(elem.firstChild!);
			}
		},
	},
	ready() {
		this.init();
	},

	beforeClose() {},
	close() {},
});
