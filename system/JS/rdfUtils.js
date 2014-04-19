var nQuadsToTriG = {};

nQuadsToTriG._WS = "[ //t]*";
nQuadsToTriG._COMMENT = "#.*";
nQuadsToTriG._PN_CHARS_BASE =	"[A-Z]|[a-z]|[\\u00C0-\\u00D6]|[\\u00D8-\\u00F6]|[\\u00F8-\\u02FF]|[\\u0370-\\u037D]|[\\u037F-\\u1FFF]|[\\u200C-\\u200D]|[\\u2070-\\u218F]|[\\u2C00-\\u2FEF]|[\\u3001-\\uD7FF]|[\\uF900-\\uFDCF]|[\\uFDF0-\\uFFFD]|[\\u10000-\\uEFFFF]";
nQuadsToTriG._PN_CHARS_U = "(?:" + nQuadsToTriG._PN_CHARS_BASE + ")|_|:";
nQuadsToTriG._PN_CHARS = "(?:" + nQuadsToTriG._PN_CHARS_U + ")|-|[0-9]|\\u00B7|[\\u0300-\\u036F]|[\\u203F-\\u2040]";
nQuadsToTriG._HEX	= "[0-9]|[A-F]|[a-f]";
nQuadsToTriG._UCHAR =	"\\\\u(?:" + nQuadsToTriG._HEX + "){4}|\\\\U(?:" + nQuadsToTriG._HEX + "){8}";
nQuadsToTriG._ECHAR =	"\\\\[tbnrf\"'\\\\]";
nQuadsToTriG._LANGTAG	= "@[a-zA-Z]+(?:-[a-zA-Z0-9]+)*";
nQuadsToTriG._EOL	= "[\\x0D\\x0A]+";
nQuadsToTriG._IRIREF = "<(?:[^\\x00-\\x20<>\"{}|^`\\\\]|(?:" + nQuadsToTriG._UCHAR + "))*>";
nQuadsToTriG._STRING_LITERAL_QUOTE = "\"(?:[^\\x22\\x5C\\x0A\\x0D]|(?:" + nQuadsToTriG._ECHAR + ")|(?:" + nQuadsToTriG._UCHAR + "))*\"";
nQuadsToTriG._BLANK_NODE_LABEL = "_:(?:(?:" + nQuadsToTriG._PN_CHARS_U + ")|[0-9])(?:(?:(?:" + nQuadsToTriG._PN_CHARS + ")|'.')*(?:" + nQuadsToTriG._PN_CHARS + "))?";

//nquadsDoc	::=	statement? (EOL statement)* EOL?
nQuadsToTriG._literal	= "(?:" + nQuadsToTriG._STRING_LITERAL_QUOTE + ")(?:^^(?:" + nQuadsToTriG._IRIREF +")|(?:" + nQuadsToTriG._LANGTAG + "))?";
nQuadsToTriG._subject = "(?:" + nQuadsToTriG._IRIREF +")|(?:" + nQuadsToTriG._BLANK_NODE_LABEL + ")";
nQuadsToTriG._predicate =	"(?:" + nQuadsToTriG._IRIREF +")";
nQuadsToTriG._object = "(?:" + nQuadsToTriG._IRIREF +")|(?:" + nQuadsToTriG._BLANK_NODE_LABEL + ")|(?:" + nQuadsToTriG._literal + ")";
nQuadsToTriG._graphLabel = "(?:" + nQuadsToTriG._IRIREF +")|(?:" + nQuadsToTriG._BLANK_NODE_LABEL + ")";
nQuadsToTriG._statement =
	"(?:(" + nQuadsToTriG._subject + ")" + nQuadsToTriG._WS +
	"(" + nQuadsToTriG._predicate + ")" + nQuadsToTriG._WS +
	"(" + nQuadsToTriG._object + ")" + nQuadsToTriG._WS +
	"(" + nQuadsToTriG._graphLabel + ")?" + nQuadsToTriG._WS + ".)?" + nQuadsToTriG._WS + "(" + nQuadsToTriG._COMMENT + ")?";

nQuadsToTriG.compactTerm = function(term, turtleStruct) {
	if (term && term.match(nQuadsToTriG._IRIREF)) {
		var iri = term.substr(1,term.length-2);
		if (turtleStruct.base && iri.substr(0,turtleStruct.base.length) == turtleStruct.base)
			return "<" + iri.substr(turtleStruct.base.length) + ">";
	}
	return term;
}

nQuadsToTriG.digestStament = function(stmt, turtleStruct) {
//	console.log(stmt);
	var stmtArray = stmt.match(nQuadsToTriG._statement);
//	console.log(stmtArray);
	var subject = nQuadsToTriG.compactTerm(stmtArray[1], turtleStruct);
	var predicate = nQuadsToTriG.compactTerm(stmtArray[2], turtleStruct);
	var object = nQuadsToTriG.compactTerm(stmtArray[3], turtleStruct);
	var graphLabel = nQuadsToTriG.compactTerm(stmtArray[4], turtleStruct);
	
	if (!subject) return;
	
	if (!turtleStruct.content) turtleStruct.content = { defaultGraph: {}, namedGraphs: {} };
//	if (!turtleStruct.content) turtleStruct.content = { defaultGraph: [], namedGraphs: [] };
	
	var graphStruct;
	if (graphLabel) {
		graphStruct = turtleStruct.content.namedGraphs[graphLabel];
		if (!graphStruct)
			turtleStruct.content.namedGraphs[graphLabel] = graphStruct = {};
//			turtleStruct.content.namedGraphs[graphLabel] = graphStruct = [];
	} else
		graphStruct = turtleStruct.content.defaultGraph;
	
	var subjectStruct = graphStruct[subject];
	if (!subjectStruct)
		graphStruct[subject] = subjectStruct = {};
//		graphStruct[subject] = subjectStruct = [];

	var predicateObjects = subjectStruct[predicate];
	if (!predicateObjects)
		subjectStruct[predicate] = predicateObjects = [];
	
	if (predicateObjects.indexOf(object) == -1)
		predicateObjects.push(object);

}

nQuadsToTriG.serializeGraph = function(graphStruct,indent) {
	//var text;
	return Object.keys(graphStruct).map(
			function(subject) {
				subjectStruct = graphStruct[subject];
				return 	this + subject + "\n" + this + "\t" +
						Object.keys(subjectStruct).map(
								function(predicate) {
									predicateObjects = subjectStruct[predicate];
									return	predicate + "\n" + this + "\t" +
											predicateObjects.map(
													function(object) {
														return object;
													}, this + "\t").join(",\n" + this + "\t");
								}, this + "\t").join(";\n" + this + "\t");
			},indent).join(".\n") + (Object.keys(graphStruct).length > 0 ? ".\n" : "");
}

nQuadsToTriG.serialize = function(turtleStruct) {
	return 	nQuadsToTriG.serializeGraph(turtleStruct.content.defaultGraph, "") + "\n" +
			Object.keys(turtleStruct.content.namedGraphs).map(
					function(graphLabel) {
						graphStruct = turtleStruct.content.namedGraphs[graphLabel];
						return	"GRAPH " + graphLabel + " {\n" +
								nQuadsToTriG.serializeGraph(graphStruct, "\t") + "}\n";
					}).join("\n");
}

nQuadsToTriG.digest = function(nQuads, turtleStruct) {
	//console.log("Stmt RegExp: " + nQuadsToTriG._statement);
	nQuads
		.split(new RegExp(nQuadsToTriG._EOL))
		.forEach(
				function(stmt) { nQuadsToTriG.digestStament(stmt, this); },
				turtleStruct );
//	console.log(JSON.stringify(turtleStruct));
}

nQuadsToTriG.convert = function(nQuads, turtleStruct) {
	nQuadsToTriG.digest(nQuads, turtleStruct);
	return turtleStruct.content ? nQuadsToTriG.serialize(turtleStruct) : "";
}

nQuadsToTriG.convertFromBase = function(nQuads, baseIRI) {
	return nQuadsToTriG.convert(nQuads, { base: baseIRI });
}

var jsonLdToTriG = {};

jsonLdToTriG.convert = function(json, base, expandContext, callback) {
	return jsonld.toRDF(
	      json,
	      { "base": base, "expandContext": expandContext, format: "application/nquads"},
	      function(err, result) {
	    	  if (err)
	    		  callback(err);
	    	  else
	    		  callback(
	    				  err,
	    				  nQuadsToTriG.convertFromBase(
	    						  result,
	    						  base.substr(0,base.lastIndexOf("/")+1) ) );
	      });
}
