//  Copyright (c) 2014 Readium Foundation and/or its licensees. All rights reserved.
//  
//  Redistribution and use in source and binary forms, with or without modification, 
//  are permitted provided that the following conditions are met:
//  1. Redistributions of source code must retain the above copyright notice, this 
//  list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright notice, 
//  this list of conditions and the following disclaimer in the documentation and/or 
//  other materials provided with the distribution.
//  3. Neither the name of the organization nor the names of its contributors may be 
//  used to endorse or promote products derived from this software without specific 
//  prior written permission.

(function(global) {

var init = function($, cfiInstructions, cfiRuntimeErrors) {

    if (typeof cfiInstructions === "undefined") {
        throw new Error("UNDEFINED?! cfiInstructions");
    }
    
    if (typeof cfiRuntimeErrors === "undefined") {
        throw new Error("UNDEFINED?! cfiRuntimeErrors");
    }
    
var obj = {

    // ------------------------------------------------------------------------------------ //
    //  "PUBLIC" METHODS (THE API)                                                          //
    // ------------------------------------------------------------------------------------ //

    generateRangeComponent : function (rangeStartElement, startOffset, rangeEndElement, endOffset, classBlacklist, elementBlacklist, idBlacklist) {
        var _document = rangeStartElement.ownerDocument;

        // Create a document range from inputs
        var docRange = _document.createRange();
        docRange.setStart(rangeStartElement, startOffset);
        docRange.setEnd(rangeEndElement, endOffset);

        return this.generateDocumentRangeComponent(docRange, classBlacklist, elementBlacklist, idBlacklist);
    },

    generateCharOffsetRangeComponent : function (rangeStartElement, startOffset, rangeEndElement, endOffset, classBlacklist, elementBlacklist, idBlacklist) {
        var _document = rangeStartElement.ownerDocument;

        this.validateStartTextNode(rangeStartElement);
        this.validateStartTextNode(rangeEndElement);

        // Create a document range to find the common ancestor
        var docRange = _document.createRange();
        docRange.setStart(rangeStartElement, startOffset);
        docRange.setEnd(rangeEndElement, endOffset);

        return this.generateDocumentRangeComponent(docRange, classBlacklist, elementBlacklist, idBlacklist);
    },

    generateElementRangeComponent : function (rangeStartElement, rangeEndElement, classBlacklist, elementBlacklist, idBlacklist) {
        var _document = rangeStartElement.ownerDocument;

        // Create a document range from inputs
        var docRange = _document.createRange();
        docRange.setStartBefore(rangeStartElement);
        docRange.setEndAfter(rangeEndElement);
       
        return this.generateDocumentRangeComponent(docRange, classBlacklist, elementBlacklist, idBlacklist);
    },

    generateDocumentRangeComponent : function (domRange, classBlacklist, elementBlacklist, idBlacklist) {
        this._normalizeDomRange(domRange);

        var rangeStartElement = domRange.startContainer;
        var startOffset = domRange.startOffset;
        var rangeEndElement = domRange.endContainer;
        var endOffset = domRange.endOffset;
        var commonAncestor = domRange.commonAncestorContainer;

        var _document = rangeStartElement.ownerDocument;

        var range1CFI;
        var range1OffsetStep;
        var range2CFI;
        var range2OffsetStep;
        var commonCFIComponent;

        if (rangeStartElement.nodeType === Node.TEXT_NODE && rangeEndElement.nodeType === Node.TEXT_NODE) {
            // Parent element is the same
            if ($(rangeStartElement).parent()[0] === $(rangeEndElement).parent()[0]) {
                range1OffsetStep = this.createCFITextNodeStep($(rangeStartElement), startOffset, classBlacklist, elementBlacklist, idBlacklist);
                range2OffsetStep = this.createCFITextNodeStep($(rangeEndElement), endOffset, classBlacklist, elementBlacklist, idBlacklist);
                commonCFIComponent = this.createCFIElementSteps($(rangeStartElement).parent(), _document.documentElement, classBlacklist, elementBlacklist, idBlacklist);
                return commonCFIComponent + "," + range1OffsetStep + "," + range2OffsetStep;
            }
        }

        if (rangeStartElement.nodeType === Node.ELEMENT_NODE &&
            rangeEndElement.nodeType === Node.ELEMENT_NODE &&
            rangeStartElement === rangeEndElement &&
            commonAncestor === rangeStartElement) {

            var startElement = commonAncestor.childNodes[startOffset];
            var endElement;
            if (endOffset === commonAncestor.childNodes.length) {
                endElement = commonAncestor.childNodes[endOffset - 1];
            } else {
                endElement = commonAncestor.childNodes[endOffset].previousSibling;
            }

            // Generate shared component
            commonCFIComponent = this.createCFIElementSteps($(commonAncestor), _document.documentElement, classBlacklist, elementBlacklist, idBlacklist);

            range1CFI = this.createCFIElementSteps($(startElement), commonAncestor, classBlacklist, elementBlacklist, idBlacklist);

            if (startElement === endElement) {
                return commonCFIComponent + range1CFI;
            }

            range2CFI = this.createCFIElementSteps($(endElement), commonAncestor, classBlacklist, elementBlacklist, idBlacklist);

            // Return the result
            return commonCFIComponent + "," + range1CFI + "," + range2CFI;
        } else {
            
            if(rangeStartElement.nodeType === Node.ELEMENT_NODE){
                this.validateStartElement(rangeStartElement);
                range1CFI = this.createCFIElementSteps($(rangeStartElement), commonAncestor, classBlacklist, elementBlacklist, idBlacklist);
            } else {
                this.validateStartTextNode(rangeStartElement);
                // Generate terminating offset and range 1
                range1OffsetStep = this.createCFITextNodeStep($(rangeStartElement), startOffset, classBlacklist, elementBlacklist, idBlacklist);
                if ($(rangeStartElement).parent()[0] === commonAncestor) {
                    range1CFI = range1OffsetStep;
                } else {
                    range1CFI = this.createCFIElementSteps($(rangeStartElement).parent(), commonAncestor, classBlacklist, elementBlacklist, idBlacklist) + range1OffsetStep;    
                }
            }

            if(rangeEndElement.nodeType === Node.ELEMENT_NODE){
                this.validateStartElement(rangeEndElement);
                range2CFI = this.createCFIElementSteps($(rangeEndElement), commonAncestor, classBlacklist, elementBlacklist, idBlacklist);
            } else {
                this.validateStartTextNode(rangeEndElement);
                // Generate terminating offset and range 2
                range2OffsetStep = this.createCFITextNodeStep($(rangeEndElement), endOffset, classBlacklist, elementBlacklist, idBlacklist);
                if ($(rangeEndElement).parent()[0] === commonAncestor) {
                    range2CFI = range2OffsetStep;
                } else {
                    range2CFI = this.createCFIElementSteps($(rangeEndElement).parent(), commonAncestor, classBlacklist, elementBlacklist, idBlacklist) + range2OffsetStep;    
                }                
            }

            // Generate shared component
            commonCFIComponent = this.createCFIElementSteps($(commonAncestor), _document.documentElement, classBlacklist, elementBlacklist, idBlacklist);

            // Return the result
            return commonCFIComponent + "," + range1CFI + "," + range2CFI;
        }
    },

    // Description: Generates a character offset CFI 
    // Arguments: The text node that contains the offset referenced by the cfi, the offset value, the name of the 
    //   content document that contains the text node, the package document for this EPUB.
    generateCharacterOffsetCFIComponent : function (startTextNode, characterOffset, classBlacklist, elementBlacklist, idBlacklist) {
        var textNodeStep;
        var contentDocCFI;
        var $itemRefStartNode;
        var packageDocCFI;

        this.validateStartTextNode(startTextNode, characterOffset);

        // Create the text node step
        textNodeStep = this.createCFITextNodeStep($(startTextNode), characterOffset, classBlacklist, elementBlacklist, idBlacklist);

        // Call the recursive method to create all the steps up to the head element of the content document (typically the "html" element, or the "svg" element)
        contentDocCFI = this.createCFIElementSteps($(startTextNode).parent(), startTextNode.ownerDocument.documentElement, classBlacklist, elementBlacklist, idBlacklist) + textNodeStep;
        return contentDocCFI;
    },

    generateElementCFIComponent : function (startElement, classBlacklist, elementBlacklist, idBlacklist) {
        var contentDocCFI;
        var $itemRefStartNode;
        var packageDocCFI;

        this.validateStartElement(startElement);

        // Call the recursive method to create all the steps up to the head element of the content document (typically the "html" element, or the "svg" element)
        contentDocCFI = this.createCFIElementSteps($(startElement), startElement.ownerDocument.documentElement, classBlacklist, elementBlacklist, idBlacklist);

        return contentDocCFI;
    },

    generatePackageDocumentCFIComponent : function (contentDocumentName, packageDocument, classBlacklist, elementBlacklist, idBlacklist) {

        this.validateContentDocumentName(contentDocumentName);
        this.validatePackageDocument(packageDocument, contentDocumentName);

        // Get the start node (itemref element) that references the content document
        var $itemRefStartNode = $(this._findSpineItemNode(packageDocument, contentDocumentName));

        // Create the steps up to the top element of the package document (the "package" element)
        var packageDocCFIComponent = this.createCFIElementSteps($itemRefStartNode, "package", classBlacklist, elementBlacklist, idBlacklist);

        // Append an !; this assumes that a CFI content document CFI component will be appended at some point
        return packageDocCFIComponent + "!";
    },

    generatePackageDocumentCFIComponentWithSpineIndex : function (spineIndex, packageDocument, classBlacklist, elementBlacklist, idBlacklist) {

        // Get the start node (itemref element) that references the content document
        var spineItemNode = packageDocument.getElementsByTagNameNS('*', 'spine');
        var $itemRefStartNode = $($(spineItemNode).children()[spineIndex]);

        // Create the steps up to the top element of the package document (the "package" element)
        var packageDocCFIComponent = this.createCFIElementSteps($itemRefStartNode, "package", classBlacklist, elementBlacklist, idBlacklist);

        // Append an !; this assumes that a CFI content document CFI component will be appended at some point
        return packageDocCFIComponent + "!";
    },

    generateCompleteCFI : function (packageDocumentCFIComponent, contentDocumentCFIComponent) {

        return "epubcfi(" + packageDocumentCFIComponent + contentDocumentCFIComponent + ")";  
    },

    // ------------------------------------------------------------------------------------ //
    //  "PRIVATE" HELPERS                                                                   //
    // ------------------------------------------------------------------------------------ //

    validateStartTextNode : function (startTextNode, characterOffset) {
        
        // Check that the text node to start from IS a text node
        if (!startTextNode) {
            throw new cfiRuntimeErrors.NodeTypeError(startTextNode, "Cannot generate a character offset from a starting point that is not a text node");
        } else if (startTextNode.nodeType != 3) {
            throw new cfiRuntimeErrors.NodeTypeError(startTextNode, "Cannot generate a character offset from a starting point that is not a text node");
        }

        // Check that the character offset is within a valid range for the text node supplied
        if (characterOffset < 0) {
            throw new cfiRuntimeErrors.OutOfRangeError(characterOffset, 0, "Character offset cannot be less than 0");
        }
        else if (characterOffset > startTextNode.nodeValue.length) {
            throw new cfiRuntimeErrors.OutOfRangeError(characterOffset, startTextNode.nodeValue.length - 1, "character offset cannot be greater than the length of the text node");
        }
    },

    validateStartElement : function (startElement) {

        this.validateTargetElement(startElement);

        if (!(startElement.nodeType && startElement.nodeType === 1)) {
            throw new cfiRuntimeErrors.NodeTypeError(startElement, "CFI target element is not an HTML element");
        }
    },

    validateTargetElement : function (startElement) {

        if (!startElement) {
            throw new cfiRuntimeErrors.NodeTypeError(startElement, "CFI target element is undefined");
        }
    },

    validateContentDocumentName : function (contentDocumentName) {

        // Check that the idref for the content document has been provided
        if (!contentDocumentName) {
            throw new Error("The idref for the content document, as found in the spine, must be supplied");
        }
    },

    validatePackageDocument : function (packageDocument, contentDocumentName) {
        
        // Check that the package document is non-empty and contains an itemref element for the supplied idref
        if (!packageDocument) {
            throw new Error("A package document must be supplied to generate a CFI");
        }

        var spineItemNode = this._findSpineItemNode(packageDocument, contentDocumentName);

        if (!spineItemNode) {
            throw new Error("The idref of the content document could not be found in the spine");
        }
    },

    _validNodeTypesFilter: function (node) {
        return node.nodeType === Node.TEXT_NODE || node.nodeType === Node.ELEMENT_NODE;
    },

    _findSpineItemNode: function (packageDocument, idref) {
        var spineItemNode = null;
        $(packageDocument.getElementsByTagNameNS('*', 'itemref')).each(function () {
            if (this.getAttribute('idref') === idref) {
                spineItemNode = this;
                return false;
            }
        });
        return spineItemNode;
    },

    _normalizeDomRange: function (domRange) {
        var rangeStartNode = domRange.startContainer;
        var rangeEndNode = domRange.endContainer;
        var commonAncestorNode = domRange.commonAncestorContainer;

        if (commonAncestorNode.nodeType !== Node.ELEMENT_NODE) {
            // No need for normalization on ranges where the ancestor is not an element
            return;
        }

        if (rangeStartNode.nodeType !== Node.TEXT_NODE && rangeEndNode.nodeType !== Node.TEXT_NODE) {
            // and one of the start/end nodes must be a text node
            return;
        }

        if (rangeStartNode === commonAncestorNode) {
            var firstChildNode = _.first(_.filter(rangeStartNode.childNodes, this._validNodeTypesFilter));
            if (firstChildNode) {
                domRange.setStart(firstChildNode, 0);
            }
        }

        if (rangeEndNode === commonAncestorNode) {
            var lastChildNode = _.last(_.filter(rangeEndNode.childNodes, this._validNodeTypesFilter));
            if (lastChildNode) {
                if (lastChildNode.length) {
                    domRange.setEnd(lastChildNode, lastChildNode.length);
                } else if (lastChildNode.hasChildNodes()) {
                    domRange.setEnd(lastChildNode, lastChildNode.childNodes.length);
                } else {
                    domRange.setEnd(lastChildNode, 1);
                }
            }
        }
    },

    // Description: Creates a CFI terminating step to a text node, with a character offset
    // REFACTORING CANDIDATE: Some of the parts of this method could be refactored into their own methods
    createCFITextNodeStep : function ($startTextNode, characterOffset, classBlacklist, elementBlacklist, idBlacklist) {

        var $parentNode;
        var $contentsExcludingMarkers;
        var CFIIndex;
        var indexOfTextNode;
        var preAssertion;
        var preAssertionStartIndex;
        var textLength;
        var postAssertion;
        var postAssertionEndIndex;

        // Find text node position in the set of child elements, ignoring any blacklisted elements 
        $parentNode = $startTextNode.parent();
        $contentsExcludingMarkers = cfiInstructions.applyBlacklist($parentNode.contents(), classBlacklist, elementBlacklist, idBlacklist);

        // Find the text node index in the parent list, inferring nodes that were originally a single text node
        var prevNodeWasTextNode;
        var indexOfFirstInSequence;
        var textNodeOnlyIndex = 0;
        var characterOffsetSinceUnsplit = 0;
        var finalCharacterOffsetInSequence = 0;
        $.each($contentsExcludingMarkers, 
            function (index) {

            // If this is a text node, check if it matches and return the current index
            if (this.nodeType === Node.TEXT_NODE || !prevNodeWasTextNode) {

                if (this.nodeType === Node.TEXT_NODE) {
                    if (this === $startTextNode[0]) {

                        // Set index as the first in the adjacent sequence of text nodes, or as the index of the current node if this 
                        //   node is a standard one sandwiched between two element nodes. 
                        if (prevNodeWasTextNode) {
                            indexOfTextNode = indexOfFirstInSequence;
                            finalCharacterOffsetInSequence = characterOffsetSinceUnsplit;
                        } else {
                            indexOfTextNode = textNodeOnlyIndex;
                        }
                        
                        // Break out of .each loop
                        return false; 
                    }

                    // Save this index as the first in sequence of adjacent text nodes, if it is not already set by this point
                    prevNodeWasTextNode = true;
                    characterOffsetSinceUnsplit = characterOffsetSinceUnsplit + this.length;
                    if (indexOfFirstInSequence === undefined) {
                        indexOfFirstInSequence = textNodeOnlyIndex;
                        textNodeOnlyIndex = textNodeOnlyIndex + 1;
                    }
                } else if (this.nodeType === Node.ELEMENT_NODE) {
                    textNodeOnlyIndex = textNodeOnlyIndex + 1;
                } else if (this.nodeType === Node.COMMENT_NODE) {
                    prevNodeWasTextNode = true;
                    characterOffsetSinceUnsplit = characterOffsetSinceUnsplit + this.length + 7; // 7 is the size of the html comment tag <!--[comment]-->
                    if (indexOfFirstInSequence === undefined) {
                        indexOfFirstInSequence = textNodeOnlyIndex;
                    }
                } else if (this.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
                    prevNodeWasTextNode = true;
                    characterOffsetSinceUnsplit = characterOffsetSinceUnsplit + this.data.length + this.target.length + 5; // 5 is the size of the instruction processing tag including the required space between the target and the data <?[target] [data]?>
                    if (indexOfFirstInSequence === undefined) {
                        indexOfFirstInSequence = textNodeOnlyIndex;
                    }
                }
            }
            // This node is not a text node
            else if (this.nodeType === Node.ELEMENT_NODE) {
                prevNodeWasTextNode = false;
                indexOfFirstInSequence = undefined;
                characterOffsetSinceUnsplit  = 0;
            } else if (this.nodeType === Node.COMMENT_NODE) {
                characterOffsetSinceUnsplit = characterOffsetSinceUnsplit + this.length + 7; // <!--[comment]-->
            } else if (this.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
                characterOffsetSinceUnsplit = characterOffsetSinceUnsplit + this.data.length + this.target.length + 5; // <?[target] [data]?>
            }
        });

        // Convert the text node index to a CFI odd-integer representation
        CFIIndex = (indexOfTextNode * 2) + 1;

        // TODO: text assertions are not in the grammar yet, I think, or they're just causing problems. This has
        //   been temporarily removed. 

        // Add pre- and post- text assertions
        // preAssertionStartIndex = (characterOffset - 3 >= 0) ? characterOffset - 3 : 0;
        // preAssertion = $startTextNode[0].nodeValue.substring(preAssertionStartIndex, characterOffset);

        // textLength = $startTextNode[0].nodeValue.length;
        // postAssertionEndIndex = (characterOffset + 3 <= textLength) ? characterOffset + 3 : textLength;
        // postAssertion = $startTextNode[0].nodeValue.substring(characterOffset, postAssertionEndIndex);

        // Gotta infer the correct character offset, as well

        // Return the constructed CFI text node step
        return "/" + CFIIndex + ":" + (finalCharacterOffsetInSequence + characterOffset);
         // + "[" + preAssertion + "," + postAssertion + "]";
    },

    createCFIElementSteps : function ($currNode, topLevelElement, classBlacklist, elementBlacklist, idBlacklist) {

        var $blacklistExcluded;
        var $parentNode;
        var currNodePosition;
        var CFIPosition;
        var idAssertion;
        var elementStep;

        // Find position of current node in parent list
        $blacklistExcluded = cfiInstructions.applyBlacklist($currNode.parent().children(), classBlacklist, elementBlacklist, idBlacklist);
        $.each($blacklistExcluded, 
            function (index, value) {

                if (this === $currNode[0]) {

                    currNodePosition = index;

                    // Break loop
                    return false;
                }
        });

        // Convert position to the CFI even-integer representation
        CFIPosition = (currNodePosition + 1) * 2;

        // Create CFI step with id assertion, if the element has an id
        if ($currNode.attr("id")) {
            elementStep = "/" + CFIPosition + "[" + $currNode.attr("id") + "]";
        }
        else {
            elementStep = "/" + CFIPosition;
        }

        // If a parent is an html element return the (last) step for this content document, otherwise, continue.
        //   Also need to check if the current node is the top-level element. This can occur if the start node is also the
        //   top level element.
        $parentNode = $currNode.parent();
        if (typeof topLevelElement === 'string' &&
            cfiInstructions._matchesLocalNameOrElement($parentNode[0], topLevelElement) ||
            cfiInstructions._matchesLocalNameOrElement($currNode[0], topLevelElement)) {
            return elementStep;
        } else if ($parentNode[0] === topLevelElement || $currNode[0] === topLevelElement) {
            return elementStep;
        } else {
            return this.createCFIElementSteps($parentNode, topLevelElement, classBlacklist, elementBlacklist, idBlacklist) + elementStep;
        }
    }
};

return obj;
}







if (typeof define == 'function' && typeof define.amd == 'object') {
    console.log("RequireJS ... cfi_generator");
    
    define(['jquery', './cfi_instructions', './cfi_runtime_errors'],
    function ($, cfiInstructions, cfiRuntimeErrors) {
        return init($, cfiInstructions, cfiRuntimeErrors);
    });
} else {
    console.log("!RequireJS ... cfi_generator");
    
    if (!global["EPUBcfi"]) {
        throw new Error("EPUBcfi not initialised on global object?! (window or this context)");
    }
    global.EPUBcfi.Generator = 
    init($,
        global.EPUBcfi.CFIInstructions,
        {
            NodeTypeError: global.EPUBcfi.NodeTypeError,
            OutOfRangeError: global.EPUBcfi.OutOfRangeError,
            TerminusError: global.EPUBcfi.TerminusError,
            CFIAssertionError: global.EPUBcfi.CFIAssertionError
        });
}

})(typeof window !== "undefined" ? window : this);
