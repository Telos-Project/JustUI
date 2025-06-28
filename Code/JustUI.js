var JustUI = {
	core: {
		create: (object) => {

			if(typeof object == "string")
				object = JustUI.core.toElement(object);

			return JustUI.core.set(document.createElement("div"), object);
		},
		extend: (...arguments) => {

			let element = arguments[0];

			let children = [];
			let index = arguments.length == 1 ? 0 : 1;

			for(let i = index; i < arguments.length; i++) {

				children = children.concat(
					Array.isArray(arguments[i]) ?
						arguments[i] :
						[arguments[i]]
				);
			}

			if(arguments.length == 1) {

				if(document.body != null)
					document.body.style.position = "absolute";

				element = document.documentElement;
			}

			for(let i = 0; i < children.length; i++) {

				if(children[i].ENTITY_NODE != null)
					element.appendChild(children[i]);

				else
					element.appendChild(JustUI.core.create(children[i]));
			}

			return element;
		},
		get: (element) => {

			if(typeof element == "string")
				return Array.from(document.querySelectorAll(element));

			let object = {
				tag: element.tagName
			}

			if(element.attributes.length > 0) {

				object.attributes = { };
				
				for(let i = 0; i < element.attributes.length; i++) {
					
					object.attributes[element.attributes[i].name] =
						element.attributes[i].value;
				}
			}

			let keys = Object.keys(element.style);

			let style = { };
			
			for(let i = 0; i < keys.length; i++) {

				if(element.style[keys[i]] != null &&
					element.style[keys[i]] != "") {

					style[keys[i]] = element.style[keys[i]];
				}
			}

			if(Object.keys(style) > 0)
				object.style = style;

			if(element.childNodes.length > 0) {

				object.content = [];
				
				for(let i = 0; i < element.childNodes.length; i++) {

					if(element.childNodes[i].nodeName == "#text")
						object.content.push(element.childNodes[i].textContent);

					else if(element.childNodes[i].tagName != null)
						object.content.push(get(element.childNodes[i]));
				}
			}

			return object;
		},
		inject: (type, content) => {
			
			let injection = document.createElement(type);
			injection.text = content;
			
			document.head.appendChild(
				injection
			).parentNode.removeChild(
				injection
			);
		},
		isVisible: (element) => {

			return !!(
				element.offsetWidth ||
				element.offsetHeight ||
				element.getClientRects().length
			);
		},
		load: (...arguments) => {

			JustUI.core.load.cache =
				JustUI.core.load.cache != null ? JustUI.core.load.cache : [];
			
			for(let i = 0; i < arguments.length; i++) {

				if(!Array.isArray(arguments[i]))
					arguments[i] = [arguments[i]];

				for(let j = 0; j < arguments[i].length; j++) {

					if(JustUI.core.load.cache.includes(arguments[i][j]))
						continue;
					
					JustUI.core.load.cache.push(arguments[i][j]);

					if(arguments[i][j].endsWith(".js"))
						loadScript(arguments[i][j]);

					if(arguments[i][j].endsWith(".css"))
						loadStyle(arguments[i][j]);
				}
			}
		},
		loadStyle: (path) => {
			
			let link = document.createElement("link");

			link.setAttribute("rel", "stylesheet");
			link.setAttribute("type", "text/css");
			link.setAttribute("href", path);

			document.head.appendChild(link);
		},
		loadScript: (path, async) => {

			let xhr = new XMLHttpRequest();
			xhr.open("GET", path, async == true);

			let text = "";

			xhr.onreadystatechange = function() {

				if(xhr.readyState === 4) {

					if(xhr.status === 200 || xhr.status == 0) {

						text = xhr.responseText;

						if(async)
							inject("script", text);
					}
				}
			}

			xhr.send(null);

			if(!async)
				inject("script", text);
		},
		remove: (...arguments) => {

			Array.from(arguments).forEach((element) => {

				if(typeof element == "string") {

					document.querySelectorAll(element).forEach(
						item => remove(item)
					);
				}
			
				else if(Array.isArray(element))
					element.forEach(item => remove(item));
			
				else if(element.parentNode != null)
					element.parentNode.removeChild(element);
			
				else
					element.innerHTML = "";
			});
		},
		scriptEngine: null,
		selectorRules: { },
		set: (element, object) => {

			object = object != null ? object : { };
			
			if(object.tag != null && object.tag != element.tagName)
				element = document.createElement(object.tag);

			if(object.attributes != null) {

				let attributeKeys = Object.keys(object.attributes);

				for(let i = 0; i < attributeKeys.length; i++) {

					element.setAttribute(
						attributeKeys[i],
						object.attributes[attributeKeys[i]]
					);
				}
			}

			if(object.style != null)
				JustUI.core.setStyle(element, object.style);

			if(object.fields != null)
				Object.assign(element, object.fields);

			if(object.content != null) {

				object.content =
					Array.isArray(object.content) ?
						object.content :
						[object.content];

				element.innerHTML = "";

				for(let i = 0; i < object.content.length; i++) {

					if(object.content[i].nodeName != null)
						element.appendChild(object.content[i]);

					else if(typeof object.content[i] == "object")
						element.appendChild(create(object.content[i]));

					else {

						element.appendChild(
							document.createTextNode("" + object.content[i])
						);
					}
				}
			}

			return element;
		},
		setFavicon: (src) => {

			JustUI.core.get("link[rel=\"shortcut icon\"]").forEach(remove);

			let link = create({
				tag: "link",
				attributes: {
					rel: "shortcut icon",
					href: "" + src
				}
			});

			document.head.appendChild(link);
		},
		setStyle: (element, styles) => {

			let keys = Object.keys(styles);

			for(let i = 0; i < keys.length; i++) {
			
				let style = keys[i];
				let value = styles[keys[i]];
			
				let result =
					element.style.cssText.match(
						new RegExp(
							"(?:[;\\s]|^)(" +
							style.replace("-", "\\-") +
							"\\s*:(.*?)(;|$))"
						)
					),
					index;
				
				if (result) {
				
					index = result.index + result[0].indexOf(result[1]);
					
					element.style.cssText =
						element.style.cssText.substring(0, index) +
						style + ": " + value + ";" +
						element.style.cssText.substring(
							index + result[1].length
						);
				}
				
				else
					element.style.cssText += " " + style + ": " + value + ";";
			}
				
			return element;
		},
		startScriptEngine: () => {

			JustUI.core.stopScriptEngine();

			JustUI.core.scriptEngine = setInterval(
				() => {

					document.querySelectorAll("*").forEach((element) => {

						if(!element.scriptEngineInitialized) {

							if(element.onStart != null)
								element.onStart(element);

							element.scriptEngineInitialized = true;
						}

						if(element.onUpdate != null)
							element.onUpdate(element);
					});

					Object.keys(JustUI.core.selectorRules).forEach((key) => {

						document.querySelectorAll(key).forEach((element) => {

							if(!element.selectorRuleInitialized) {
			
								JustUI.core.set(
									element, JustUI.core.selectorRules[key]
								);
			
								element.selectorRuleInitialized = true;
							}
						});
					});
				},
				1000 / 60
			)
		},
		stopScriptEngine: () => {

			if(JustUI.core.scriptEngine == null)
				return;

			clearInterval(JustUI.core.scriptEngine);

			JustUI.core.scriptEngine = null;
		},
		toCSS: (object) => {

			let css = "";

			let keys = Object.keys(object);

			for(let i = 0; i < keys.length; i++) {

				css += keys[i] + "{";

				let styleKeys = Object.keys(object[keys[i]]);

				for(let j = 0; j < styleKeys.length; j++) {

					css +=
						styleKeys[j] +
						":" +
						object[keys[i]][styleKeys[j]] +
						";";
				}

				css += "}";
			}

			return css;
		},
		toElement: (string) => {

			let element = document.createElement("div");
			element.innerHTML = string;

			return JustUI.core.get(element.childNodes[0]);
		},
		toHTML: (object) => {
			return JustUI.core.create(object).outerHTML;
		},
		toStyle: (string) => {

			// STUB

			return { };
		}
	},
	utils: {
		input: {
			addInput: (element, input, onChange) => {

				if(input == null) {

					element.input = { };

					input = element.input;
				}

				input = typeof input == "object" ? input : { };

				input.pc = {
					keyboard: [],
					mouse: {
						position: {
							x: 0,
							y: 0
						},
						buttons: {
							left: false,
							middle: false,
							right: false
						},
						scroll: 0
					}
				};

				onChange = onChange != null ? onChange : () => { };

				element.addEventListener(
					"keydown",
					function(event) {

						let previous = JSON.parse(JSON.stringify(input));
						
						if(!input.pc.keyboard.includes(
							JustUI.utils.input.cleanKey(event.code)
						)) {

							input.pc.keyboard.push(
								JustUI.utils.input.cleanKey(event.code)
							);
						}

						onChange(previous, input);
					}
				);

				element.addEventListener(
					"keyup",
					function(event) {

						let previous = JSON.parse(JSON.stringify(input));

						for(let i = 0; i < input.pc.keyboard.length; i++) {
							
							if(input.pc.keyboard[i] ==
								JustUI.utils.input.cleanKey(event.code)) {

								input.pc.keyboard.splice(i, 1);

								i--;
							}
						}

						onChange(previous, input);
					}
				);

				element.addEventListener(
					"mousedown",
					function(event) {

						let previous = JSON.parse(JSON.stringify(input));
						
						if(event.button == 0)
							input.pc.mouse.buttons.left = true;
						
						if(event.button == 1)
							input.pc.mouse.buttons.middle = true;
						
						if(event.button == 2)
							input.pc.mouse.buttons.right = true;

						onChange(previous, input);
					}
				);

				element.addEventListener(
					"mouseup",
					function(event) {

						let previous = JSON.parse(JSON.stringify(input));

						if(event.button == 0)
							input.pc.mouse.buttons.left = false;
						
						if(event.button == 1)
							input.pc.mouse.buttons.middle = false;
						
						if(event.button == 2)
							input.pc.mouse.buttons.right = false;

						onChange(previous, input);
					}
				);

				element.addEventListener(
					"wheel",
					function(event) {

						let previous = JSON.parse(JSON.stringify(input));

						input.pc.mouse.scroll = event.deltaY;

						setTimeout(
							function() {
								input.pc.mouse.scroll = 0;
							},
							1000 / 60
						);

						onChange(previous, input);
					}
				);
			},
			cleanKey: (key) => {

				return key.
					split("Key").join("").
					split("Digit").join("").
					split("Arrow").join("").
					toLowerCase();
			}
		},
		speech: {
			getVoices: () => {

				let voices = window.speechSynthesis.getVoices();
				let voiceList = [];

				for(let i = 0; i < voices.length; i++)
					voiceList.push(voices[i].voiceURI);

				voiceList.sort();

				if(voiceList.length > 0)
					return voiceList;

				return [
					"Google Bahasa Indonesia",
					"Google Deutsch",
					"Google Nederlands",
					"Google UK English Female",
					"Google UK English Male",
					"Google US English",
					"Google español",
					"Google español de Estados Unidos",
					"Google français",
					"Google italiano",
					"Google polski",
					"Google português do Brasil",
					"Google русский",
					"Google हिन्दी",
					"Google 國語（臺灣）",
					"Google 日本語",
					"Google 한국의",
					"Google 普通话（中国大陆）",
					"Google 粤語（香港）",
					"Microsoft David - English (United States)",
					"Microsoft Mark - English (United States)",
					"Microsoft Zira - English (United States)"
				];
			},
			isSpeaking: () => {
				return window.speechSynthesis.speaking;
			},
			listen: (callback) => {

				callback = Array.isArray(callback) ? callback : [callback];

				if(JustUI.utils.speech.recognition.listening)
					JustUI.utils.speech.recognition.abort();

				JustUI.utils.speech.recognition =
					new webkitSpeechRecognition();

				JustUI.utils.speech.recognition.continuous = true;
				
				JustUI.utils.speech.recognition.onresult = function(event) {

					for(let i = 0; i < callback.length; i++) {

						callback[i](
							event.results[
								event.results.length - 1
							][0].transcript.trim()
						);
					}
				}
				
				JustUI.utils.speech.recognition.onend = function(event) {

					setTimeout(() => {
						listen(callback);
					}, 100);
				}
				
				JustUI.utils.speech.recognition.start();

				JustUI.utils.speech.recognition.listening = true;
			},
			recognition: (() => {

				try {

					window.speechSynthesis.getVoices();

					let recognition = new webkitSpeechRecognition();

					recognition.continuous = true;
					recognition.listening = false;

					return recognition;
				}

				catch(error) {
					return null;
				}
			})(),
			speak: (text, settings) => {

				setTimeout(
					function() {
				
						if(text.trim() == "")
							return;
					
						settings = settings != null ? settings : { };

						settings.voice =
							settings.voice != null ?
								settings.voice :
								"Microsoft Mark - English (United States)";

						settings.voice = settings.voice.trim().toLowerCase();
					
						let voices = window.speechSynthesis.getVoices();
						let utterance = new SpeechSynthesisUtterance(text);
					
						for(let i = 0; i < voices.length; i++) {
					
							if(voices[i].voiceURI.toLowerCase() ==
								settings.voice) {
					
								utterance.voice = voices[i];
					
								break;
							}
						}
					
						utterance.pitch =
							settings.pitch != null ? settings.pitch : 1;

						utterance.rate =
							settings.rate != null ? settings.rate : 1;
					
						window.speechSynthesis.speak(utterance);
					},
					1
				);
			},
			stopSpeaking: () => {
				window.speechSynthesis.canel();
			},
			stopListening: () => {

				if(JustUI.utils.speech.recognition.listening)
					JustUI.utils.speech.recognition.abort();

				JustUI.utils.speech.recognition.listening = false;
			}
		}
	}
};

if(typeof module == "object")
	module.exports = JustUI;