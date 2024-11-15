export const preferencesTemplate = <const>{
	"promptTimeUnitDialogOnStart": {
		default: true,
		type: "boolean",
		title: "Prompt TimeUnitDialog on Startup",
		description: "Controls if the TimeUnitDialog is shown on startup."
	},
	"forceTimeUnit": {
		default: true,
		type: "boolean",
		title: "Force TimeUnit",
		description: "Controls if a TimeUnit must be set in order to edit."
	},
	"showFunctionHelper": {
		default: false,
		type: "boolean",
		title: "Show Function Helper",
		description: "Show help in DefinitionEditor depending on cursor position. (Experimental feature)",
		image: "./graphics/showArgumentHelper.png",
	},
	"showConverterPlotPreview": {
		default: true,
		type: "boolean",
		title: "Show Converter Plot Preview",
		description: "Show Converter Plot Preview while editing converter values."
	}
	// primitiveFontSize
	// showArgumentHelper
	// theme (classic/modern)
}

export class Preferences {
	static setup() {
		const prefs = Preferences.get()
		Object.entries(preferencesTemplate).forEach(([key, info]) => {
			if (prefs[key] == undefined)
				prefs[key] = info.default
		})
		Preferences.store(prefs)
	}
	static get(key?: string) {
		const prefsString = localStorage.getItem("preferences")
		const prefs = prefsString ? JSON.parse(prefsString) : {}
		return key ? prefs[key] : prefs
	}
	static set(key: string, value: any) {
		const prefs = Preferences.get()
		prefs[key] = value
		Preferences.store(prefs)
	}
	static store(object: any) {
		localStorage.setItem("preferences", JSON.stringify(object))
	}
}