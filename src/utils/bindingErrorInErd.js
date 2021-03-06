export function checkElementBindingError(element, elementJSON, linkJSON, attributeMap, relatedAttributes) {
    if (!linkJSON || !element) return "";
    element.paragraph = element.paragraph.trim();
    // Lỗi mối kết hợp không liên kết với thực thể nào hoặc chỉ có một liên kết với thực thể
    // Lỗi (CỤM) thuộc tính liên kết tới nhiều thực thể (mối kết hợp) hoặc tạo thành chu trình hoặc đứng một mình
    // Lỗi thuộc tính/mối kết hợp/thực thể  không có nội dung
     
    let connectedLinkCount = 0;
    //let isAloneAttribute = true;
    linkJSON.links.forEach((link) => {
        if(link) {
            let remainingElementId = 0;
            if (link.sourceId === element.id)
                remainingElementId = link.targetId;
            else if (link.targetId===element.id)
                remainingElementId = link.sourceId;
            if (remainingElementId){
                if (element.type==="Relationship" || element.type==="IdentifyingRelationship" || element.type==="ISA"){
                    if (elementJSON["elements"][remainingElementId - 1]){
                        if (elementJSON["elements"][remainingElementId - 1].type === "Entity" || elementJSON["elements"][remainingElementId - 1].type === "WeakEntity" || elementJSON["elements"][remainingElementId - 1].type === "AssociativeEntity")
                            connectedLinkCount++;
                    }
                }
                // else if(element.type==="Attribute" || element.type==="Normal" || element.type==="Key" || element.type==="Multivalued" || element.type==="Derived" || element.type==="PartialKeyAttribute"){
                //     if (elementJSON["elements"][remainingElementId - 1]){
                //         if (elementJSON["elements"][remainingElementId - 1].type === "Entity" || elementJSON["elements"][remainingElementId - 1].type === "WeakEntity" || elementJSON["elements"][remainingElementId - 1].type === "AssociativeEntity" || elementJSON["elements"][remainingElementId - 1].type === "Relationship" || elementJSON["elements"][remainingElementId - 1].type === "IdentifyingRelationship" || elementJSON["elements"][remainingElementId - 1].type === "ISA")
                //             connectedLinkCount++;
                //         else if (elementJSON["elements"][remainingElementId - 1].type === "Attribute" || elementJSON["elements"][remainingElementId - 1].type === "Normal" || elementJSON["elements"][remainingElementId - 1].type === "Key" || elementJSON["elements"][remainingElementId - 1].type === "Multivalued" || elementJSON["elements"][remainingElementId - 1].type === "Derived" || elementJSON["elements"][remainingElementId - 1].type === "PartialKeyAttribute")
                //             isAloneAttribute = false;
                //     }
                // }
            }
        }
    })

    // Lỗi mối kết hợp không liên kết với thực thể nào hoặc chỉ có một liên kết với thực thể
    if(element.type==="Relationship" || element.type==="IdentifyingRelationship" || element.type==="ISA"){
        if(connectedLinkCount===0){
            let errorName = "Lỗi mối kết hợp " + element.paragraph + " không liên kết với thực thể nào";
            if(!element.paragraph) errorName += " và không có nội dung";
            return errorName;
        } 

        if(connectedLinkCount===1){
            let errorName = "Lỗi mối kết hợp " + element.paragraph + " chỉ có một liên kết với thực thể";
            if(!element.paragraph) errorName += " và không có nội dung";
            return errorName;
        }

        // if(connectedLinkCount>3){
        //     let errorName = "Lỗi mối kết hợp " + element.paragraph + " có nhiều hơn ba liên kết tới";
        //     if(!element.paragraph) errorName += " và không có nội dung";
        //     return errorName;
        // }
    }

    // Lỗi (CỤM) thuộc tính liên kết tới nhiều thực thể (mối kết hợp) hoặc tạo thành chu trình hoặc đứng một mình
    if(element.type==="Attribute" || element.type==="Normal" || element.type==="Key" || element.type==="Multivalued" || element.type==="Derived" || element.type==="PartialKeyAttribute"){
        let attributeStack = [];
        let count = 0;
        let isTrace = [];
        elementJSON.elements.forEach((element) => isTrace.push(false));
        isTrace[element.id - 1] = true;
        let isError = false;
        let connectToManyEntityOrRelationshipError = false;
        let makeCycleError = false;
        let aloneAttributeError = false;
        let curElement = element;
        while(1) {
            // duyet link ke
            attributeMap[curElement.id-1].forEach((neighborLink) => {
                if (neighborLink){
                    // tim dinh ke
                    let neighborElement;
                    if (curElement.id===neighborLink.sourceId) neighborElement=elementJSON.elements[neighborLink.targetId - 1];
                    else neighborElement=elementJSON.elements[neighborLink.sourceId - 1];
                    if (!neighborElement) return "";
                    // duyet roi thi bo qua
                    if (!isTrace[neighborElement.id - 1]){
                        // push dinh ke vao stack
                        if (neighborElement.type==="Attribute" || neighborElement.type==="Normal" || neighborElement.type==="Key" || neighborElement.type==="Multivalued" || neighborElement.type==="Derived" || neighborElement.type==="PartialKeyAttribute")
                            attributeStack.push(neighborElement);
                        // dem element ko phai la attribute
                        else {
                            count++;
                        }
                    }
                }
            });
            // lien ket voi nhieu thuc the, moi ket hop => loi
            if (count >= 2) connectToManyEntityOrRelationshipError = true;
            let topAttributeStack = attributeStack.pop();
            if (topAttributeStack){
                // tao thanh chu trinh => loi
                if (isTrace[topAttributeStack.id-1]) makeCycleError = true;
                // danh dau dinh vua pop va gan curElement thanh dinh do
                isTrace[topAttributeStack.id-1] = true;
                curElement = topAttributeStack;
            // stack rong thi out
            } else{
                break;
            }
        }
        // dung mot minh => loi
        if (count === 0) aloneAttributeError = true;
        if (connectToManyEntityOrRelationshipError || makeCycleError || aloneAttributeError) {
            let errorName = "Lỗi (CỤM) thuộc tính ";
            isTrace.forEach((isTraceItem, index) => {
                if (isTraceItem){
                    errorName += elementJSON.elements[index].paragraph + ", "
                }
            });
            errorName = errorName.substr(0, errorName.length - 2);
            if (connectToManyEntityOrRelationshipError)
                errorName += " liên kết tới nhiều thực thể  (mối kết hợp), ";
            if (makeCycleError)
                errorName += " tạo thành chu trình, ";
            if (aloneAttributeError)
                errorName += " đứng một mình, ";
            errorName = errorName.substr(0, errorName.length - 2);

            isTrace.forEach((isTraceItem, index) => {
                if (isTraceItem){
                    relatedAttributes[index] = errorName;
                }
            });
            return errorName;
        }
        
        // if(connectedLinkCount === 0 && isAloneAttribute) {
        //     let errorName = "Lỗi thuộc tính " + element.paragraph + " đứng một mình";
        //     if(!element.paragraph) errorName += " và không có nội dung";
        //     return errorName;
        // }

        // if (connectedLinkCount >1) {
        //     let errorName = "Lỗi thuộc tính " + element.paragraph + " liên kết tới nhiều thực thể hoặc mối kết hợp";
        //     if(!element.paragraph) errorName += " và không có nội dung";
        //     return errorName;
        // }
    }

    


    // Lỗi thuộc tính/mối kết hợp/thực thể  không có nội dung
    if(!element.paragraph) {
        if(element.type==="Relationship" || element.type==="IdentifyingRelationship" || element.type==="ISA")
            return "Lỗi mối kết hợp " + element.paragraph + " không có nội dung";
        if(element.type==="Attribute" || element.type==="Normal" || element.type==="Key" || element.type==="Multivalued" || element.type==="Derived" || element.type==="PartialKeyAttribute")
            return "Lỗi thuộc tính " + element.paragraph + " không có nội dung";
        if(element.type==="Entity" || element.type==="WeakEntity" || element.type==="AssociativeEntity")
            return "Lỗi thực thể  " + element.paragraph + " không có nội dung";
    }

    return "";
}

export function checkLinkBindingError(link, elementJSON) {
    if (!elementJSON || !link) return "";
    // Lỗi mối kết hợp yếu với thực thể yếu nhưng lại vẽ liên kết đơn
    // Lỗi mối kết hợp yếu với thực thể mạnh nhưng lại vẽ liên kết đôi
    // Lỗi mối kết hợp mạnh với thực thể mạnh nhưng lại vẽ liên kết đôi
    // Lỗi mối kết hợp mạnh với thực thể yếu nhưng lại vẽ liên kết đôi

    // Lỗi hai thực thể liên kết trực tiếp với nhau mà không có mối kết hợp
    // Lỗi hai mối kết hợp liên kết trực tiếp với nhau

    // Lỗi hai thuộc tính liên kết trực tiếp với nhau nhưng lại vẽ liên kết đôi
    // Lỗi hai thuộc tính liên kết trực tiếp với nhau mà có bản số

    // Lỗi thực thể liên kết với thuộc tính nhưng lại vẽ liên kết đôi
    // Lỗi thực thể liên kết với thuộc tính mà có bản số

    // Lỗi mối kết hợp liên kết với thuộc tính nhưng lại vẽ liên kết đôi
    // Lỗi mối kết hợp liên kết với thuộc tính mà có bản số

    // Lỗi liên kết giữa thực thể và mối kết hợp không có bản số

    let ele1;
    let ele2;
    elementJSON.elements.forEach((element)=>{
        if(element && element.id===link.sourceId){
            ele1=element;
        }

        if(element && element.id===link.targetId){
            ele2=element;
        }
    })
    if (!ele1 || !ele2) return "";

    // Lỗi mối kết hợp yếu với thực thể yếu nhưng lại vẽ liên kết đơn
    if(ele1.type==="IdentifyingRelationship" && ele2.type==="WeakEntity" && link.type==="PartialParticipation") {
        return "Lỗi mối kết hợp yếu " + ele1.paragraph + " với thực thể yếu " + ele2.paragraph + " nhưng lại vẽ liên kết đơn";
    }

    else if(ele2.type==="IdentifyingRelationship" && ele1.type==="WeakEntity" && link.type==="PartialParticipation") {
        return "Lỗi mối kết hợp yếu " + ele2.paragraph + " với thực thể yếu " + ele1.paragraph + " nhưng lại vẽ liên kết đơn";
    }

    // Lỗi mối kết hợp yếu với thực thể mạnh nhưng lại vẽ liên kết đôi
    if(ele1.type==="IdentifyingRelationship" && ele2.type==="Entity" && link.type==="TotalParticipation") {
        return "Lỗi mối kết hợp yếu " + ele1.paragraph + " với thực thể mạnh " + ele2.paragraph + " nhưng lại vẽ liên kết đôi";
    }

    else if(ele2.type==="IdentifyingRelationship" && ele1.type==="Entity" && link.type==="TotalParticipation") {
        return "Lỗi mối kết hợp yếu " + ele2.paragraph + " với thực thể mạnh " + ele1.paragraph + " nhưng lại vẽ liên kết đôi";
    }

    // Lỗi mối kết hợp mạnh với thực thể mạnh nhưng lại vẽ liên kết đôi
    if(ele1.type==="Relationship" && ele2.type==="Entity" && link.type==="TotalParticipation") {
        return "Lỗi mối kết hợp mạnh " + ele1.paragraph + " với thực thể mạnh " + ele2.paragraph + " nhưng lại vẽ liên kết đôi";
    }

    else if(ele2.type==="Relationship" && ele1.type==="Entity" && link.type==="TotalParticipation") {
        return "Lỗi mối kết hợp mạnh " + ele2.paragraph + " với thực thể mạnh " + ele1.paragraph + " nhưng lại vẽ liên kết đôi";
    }

    // Lỗi mối kết hợp mạnh với thực thể yếu nhưng lại vẽ liên kết đôi
    if(ele1.type==="Relationship" && ele2.type==="WeakEntity" && link.type==="TotalParticipation") {
        return "Lỗi mối kết hợp mạnh " + ele1.paragraph + " với thực thể yếu " + ele2.paragraph + " nhưng lại vẽ liên kết đôi";
    }

    else if(ele2.type==="Relationship" && ele1.type==="WeakEntity" && link.type==="TotalParticipation") {
        return "Lỗi mối kết hợp mạnh " + ele2.paragraph + " với thực thể yếu " + ele1.paragraph + " nhưng lại vẽ liên kết đôi";
    }

    // Lỗi hai thực thể liên kết trực tiếp với nhau mà không có mối kết hợp
    if((ele1.type==="Entity" || ele1.type==="WeakEntity" || ele1.type==="AssociativeEntity") && (ele2.type==="Entity" || ele2.type==="WeakEntity" || ele2.type==="AssociativeEntity")) {
        return "Lỗi hai thực thể " + ele1.paragraph + " và " + ele2.paragraph + " liên kết trực tiếp với nhau mà không có mối kết hợp";
    }

    // Lỗi hai mối kết hợp liên kết trực tiếp với nhau
    if ((ele1.type==="Relationship" || ele1.type==="IdentifyingRelationship" || ele1.type==="ISA") && (ele2.type==="Relationship" || ele2.type==="IdentifyingRelationship" || ele2.type==="ISA")) {
        return "Lỗi hai mối kết hợp " + ele1.paragraph + " và " + ele2.paragraph + " liên kết trực tiếp với nhau";
    }

    // Lỗi hai thuộc tính liên kết trực tiếp với nhau nhưng lại vẽ liên kết đôi
    // Lỗi hai thuộc tính liên kết trực tiếp với nhau mà có bản số
    if ((ele1.type==="Attribute" || ele1.type==="Normal" || ele1.type==="Key" || ele1.type==="Multivalued" || ele1.type==="Derived" || ele1.type==="PartialKeyAttribute") && (ele2.type==="Attribute" || ele2.type==="Normal" || ele2.type==="Key" || ele2.type==="Multivalued" || ele2.type==="Derived" || ele2.type==="PartialKeyAttribute")) {
        if (link.type==="TotalParticipation")
            return "Lỗi thuộc tính " + ele1.paragraph + " liên kết với thuộc tính  " + ele2.paragraph + " nhưng lại vẽ liên kết đôi";
        if (link.paragraph !== "")
            return "Lỗi thuộc tính " + ele1.paragraph + " liên kết với thuộc tính  " + ele2.paragraph + " mà có bản số";
    }

    // Lỗi thực thể liên kết với thuộc tính nhưng lại vẽ liên kết đôi
    // Lỗi thực thể liên kết với thuộc tính mà có bản số
    if ((ele1.type==="Entity" || ele1.type==="WeakEntity" || ele1.type==="AssociativeEntity") && (ele2.type==="Attribute" || ele2.type==="Normal" || ele2.type==="Key" || ele2.type==="Multivalued" || ele2.type==="Derived" || ele2.type==="PartialKeyAttribute")) {
        if (link.type==="TotalParticipation")
            return "Lỗi thực thể " + ele1.paragraph + " liên kết với thuộc tính  " + ele2.paragraph + " nhưng lại vẽ liên kết đôi";
        if (link.paragraph !== "")
            return "Lỗi thực thể " + ele1.paragraph + " liên kết với thuộc tính  " + ele2.paragraph + " mà có bản số";
    }

    if ((ele2.type==="Entity" || ele2.type==="WeakEntity" || ele2.type==="AssociativeEntity") && (ele1.type==="Attribute" || ele1.type==="Normal" || ele1.type==="Key" || ele1.type==="Multivalued" || ele1.type==="Derived" || ele1.type==="PartialKeyAttribute")) {
        if (link.type==="TotalParticipation")
            return "Lỗi thực thể " + ele2.paragraph + " liên kết với thuộc tính  " + ele1.paragraph + " nhưng lại vẽ liên kết đôi";
        if (link.paragraph !== "")
            return "Lỗi thực thể " + ele2.paragraph + " liên kết với thuộc tính  " + ele1.paragraph + " mà có bản số";
    }

    // Lỗi mối kết hợp liên kết với thuộc tính nhưng lại vẽ liên kết đôi
    // Lỗi mối kết hợp liên kết với thuộc tính mà có bản số
    if ((ele1.type==="Relationship" || ele1.type==="IdentifyingRelationship" || ele1.type==="ISA") && (ele2.type==="Attribute" || ele2.type==="Normal" || ele2.type==="Key" || ele2.type==="Multivalued" || ele2.type==="Derived" || ele2.type==="PartialKeyAttribute")) {
        if (link.type==="TotalParticipation")
            return "Lỗi mối kết hợp " + ele1.paragraph + " liên kết với thuộc tính  " + ele2.paragraph + " nhưng lại vẽ liên kết đôi";
        if (link.paragraph !== "")
            return "Lỗi mối kết hợp " + ele1.paragraph + " liên kết với thuộc tính  " + ele2.paragraph + " mà có bản số";
    }

    if ((ele2.type==="Relationship" || ele2.type==="IdentifyingRelationship" || ele2.type==="ISA") && (ele1.type==="Attribute" || ele1.type==="Normal" || ele1.type==="Key" || ele1.type==="Multivalued" || ele1.type==="Derived" || ele1.type==="PartialKeyAttribute")) {
        if (link.type==="TotalParticipation")
            return "Lỗi mối kết hợp " + ele2.paragraph + " liên kết với thuộc tính  " + ele1.paragraph + " nhưng lại vẽ liên kết đôi";
        if (link.paragraph !== "")
            return "Lỗi mối kết hợp " + ele2.paragraph + " liên kết với thuộc tính  " + ele1.paragraph + " mà có bản số";
    }

    // Lỗi liên kết giữa thực thể và mối kết hợp không có bản số
    if ((ele1.type==="Entity" || ele1.type==="WeakEntity" || ele1.type==="AssociativeEntity") && (ele2.type==="Relationship" || ele2.type==="IdentifyingRelationship" || ele2.type==="ISA")) {
        if (link.paragraph === "")
            return "Lỗi thực thể " + ele1.paragraph + " liên kết với mối kết hợp  " + ele2.paragraph + " mà không có bản số";
    }

    if ((ele2.type==="Entity" || ele2.type==="WeakEntity" || ele2.type==="AssociativeEntity") && (ele1.type==="Relationship" || ele1.type==="IdentifyingRelationship" || ele1.type==="ISA")) {
        if (link.paragraph === "")
            return "Lỗi thực thể " + ele2.paragraph + " liên kết với mối kết hợp  " + ele1.paragraph + " mà không có bản số";
    }

    return "";
}