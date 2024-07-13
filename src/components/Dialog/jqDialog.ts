import $ from "jquery"
import "jquery-ui/ui/widgets/dialog"

export class jqDialog {
  // This is a static attribute that prevents delete key etc to be relevant when a dialog is open
  static blockingDialogOpen = false
  
  dialog: any; // TODO what type?
  contentHTML: string;
  title: string;
  size: [number, number];
  visible: boolean;
  // Decides if we this dialog should lock the background
  modal: boolean;
  dialogDiv: HTMLDivElement;
  dialogContent: HTMLDivElement;
	dialogParameters: JQueryUI.DialogOptions

	constructor(title = null, contentHTML = null, size = null) {
		this.dialog = null;

		this.contentHTML = "Empty dialog";
		this.title = "Title";
		this.size = [600,400];
		
		if (contentHTML) {
			this.contentHTML = contentHTML;
		}
		if (title) {
			this.title = title;
		}
		if (size) {
			this.size = size;
		}
		
		this.visible = false;
		// Decides if we this dialog should lock the background
		this.modal = true;
		let frm_dialog_resize = true;
		
		this.dialogDiv = document.createElement("div");
		this.dialogDiv.setAttribute("title",this.title);
		this.dialogDiv.setAttribute("style", "font-size: 13px; display: inline-block");
		this.dialogDiv.style.display = "none";

		this.dialogContent = document.createElement("div");
		this.dialogContent.innerHTML=this.contentHTML;
		
		this.dialogDiv.appendChild(this.dialogContent);	
		document.body.appendChild(this.dialogDiv);

		this.dialogContent.setAttribute("style", "display: inline-block");
		
		
		this.dialogParameters = {
			autoOpen: false,
			modal: this.modal, // Adds overlay on background
			resizable: false,
			resize: (event,ui) => {
				this.resize(event,ui);
			},
			resizeStart: (event,ui) => {
				this.resizeStart(event,ui);
			},
			resizeStop: (event, ui) => {
				this.resizeStop(event, ui);
			},
			position: {
			   my: "center",
			   at: "center",
			   of: window
			},
			beforeClose: () => {
				this.beforeClose();
			},
			close: () => {
				this.visible = false;
				jqDialog.blockingDialogOpen = false;
				this.afterClose();
			},
			width: this.size[0],
			height: this.size[1],
			open: ( event, ui ) => {
				if (this.dialogParameters.modal) {
					jqDialog.blockingDialogOpen = true;
				}
				
				let windowWidth = $(window).width()!;
				let windowHeight = $(window).height()!;
				$(event.target).css("maxWidth", (windowWidth-50)+"px");
				$(event.target).css("maxHeight", (windowHeight-50)+"px");
			}
		};
		this.dialogParameters.buttons = {
			"Cancel":() => {
				$(this.dialog).dialog('close');
			},
			"Apply": () => {
				this.applyChanges();
			}
		};
		this.dialogParameters.width = "auto";
		this.dialogParameters.height = "auto";
		this.beforeCreateDialog();
		this.dialog = $(this.dialogDiv).dialog(this.dialogParameters);
	}
	bindEnterApplyEvents() {
		$(this.dialogContent).find(".enter-apply").keydown(event => {
			if (! event.shiftKey) {
				if (event.key === "Enter") {
					event.preventDefault();
					this.applyChanges();
				}
			}
		});
	}
	renderHelpButtonHtml(helpId: string) {
		return (`<button id="${helpId}" class="help-button enter-apply" tabindex="-1" >
			?
		</button>`);
	}

	setHelpButtonInfo(helpId: string, title: string, contentHTML: string) {
		$(this.dialogContent).find(`#${helpId}`).unbind();
		$(this.dialogContent).find(`.enter-apply#${helpId}`).keydown(event => {
			if (! event.shiftKey) {
				if (event.key === "Enter") {
					event.preventDefault();
					this.applyChanges();
				}
			}
		});
		$(this.dialogContent).find(`#${helpId}`).on("click", event => {
			// TODO fix this circular import somehow
			// let dialog = new XAlertDialog(contentHTML);
			// $(dialog.dialogContent).find(".accordion").accordion({
			// 	heightStyle: "content",
			// 	active: false, 
			// 	header: "h3", 
			// 	collapsible: true 
			// });
			// dialog.setTitle(title);
			// dialog.show();
		})
	}

	applyChanges() {
		this.makeApply();
		$(this.dialog).dialog('close');
		// We add a delay to make sure we closed first
		
		setTimeout(() => {
			// History.storeUndoState(); // TODO add History
			// InfoBar.update(); // TODO add InfoBar
		}, 200);
	}
	makeApply() {
		
	}
	getWidth() {
		return this.dialog.width();
	}
	getHeight() {
		return this.dialog.height();
	}
	resize(event: any, ui: any) { // TODO fix types 
		
	}
	resizeStart(event: any, ui: any) { // TODO fix types 
		
	}
	resizeStop(event: any, ui: any) { // TODO fix types 
		
	}
	beforeCreateDialog() {
		
	}
	beforeClose() {
		
	}
	afterClose() {
		
	}
	beforeShow() {
		
	}
	afterShow() {
		
	}
	show() {
		this.beforeShow();
		this.dialog.dialog("open");
		this.visible = true;
		this.afterShow();
	}
	setTitle(newTitle: string) {
		this.title = newTitle;
		this.dialog.dialog( "option", "title", this.title);		
	}
	getTitle() {
		return this.title;
	}
	setHtml(newHtml: string) {
		this.dialogContent.innerHTML = newHtml;
	}
	getHtml() {
		return this.dialogContent.innerHTML;
	}
}