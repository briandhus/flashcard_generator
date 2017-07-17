function ClozeCard(text, cloze) {
	// make it scope-safe
	if (this instanceof ClozeCard) {

		this.text = text;
		this.cloze = cloze;
		this.partialtext = this.text.replace(cloze, "...")
	} else {
		return new ClozeCard(text, cloze);
	}
}

module.exports(ClozeCard);