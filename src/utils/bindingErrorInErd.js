export function checkElementBindingError(element, linkJSON) {
    if (!linkJSON || !element) return "";
    element.paragraph = element.paragraph.trim();
    // let array_errors = [' Loi moi ket hop dung mot minh',
    // ' Loi moi ket hop chi co mot lien ket toi',
    // ' Loi thuoc tinh dung mot minh',
    // ' Loi thuoc tinh ket hop toi nhieu thuc the hoac moi ket hop',
    // ' Loi moi ket hop yeu ket hop voi thuc the yeu nhung lai ve lien ket don',
    // ' Loi moi ket hop yeu ket hop voi thuc the manh nhung lai ve lien ket doi',
    // ' Loi moi ket hop manh voi thuc the manh nhung lai ve lien ket doi',
    // ' Loi moi ket hop manh voi thuc the yeu nhung lai ve lien ket doi',
    // ' Loi hai thuc the lien ket truc tiep voi nhau ma khong co moi ket hop'];
    
    let connectedLinkCount = 0;
    linkJSON.links.forEach((link) => {
        if(link && (link.sourceId === element.id || link.targetId===element.id)) {
            connectedLinkCount++;
            //alert("" + linkConnectedToElement.sourceId + "\t" + linkConnectedToElement.targetId + "\t" + element.paragraph);
        }
    })

    // Lỗi mối kết hợp đứng một mình hoặc có một liên kết tới
    if(element.type==="Relationship" || element.type==="IdentifyingRelationship" || element.type==="ISA"){
        if(connectedLinkCount===0){
            let errorName = "Lỗi mối kết hợp " + element.paragraph + " đứng một mình";
            if(!element.paragraph) errorName += " và không có nội dung";
            return errorName;
            //console.log(element.paragraph + array_errors[0]);   // Lỗi mối kết hợp đứng một mình
        } 

        if(connectedLinkCount===1){
            let errorName = "Lỗi mối kết hợp " + element.paragraph + " chỉ có một liên kết tới";
            if(!element.paragraph) errorName += " và không có nội dung";
            return errorName;
            //console.log(element.paragraph + array_errors[1]);   // Lỗi mối kết hợp chỉ có một liên kết tới
        }
    }

    // Lỗi thuộc tính đứng một mình hoặc liên kết tới nhiều thực thể (mối kết hợp)
    if(element.type==="Attribute" || element.type==="Normal" || element.type==="Key" || element.type==="Multivalued" || element.type==="Derived" || element.type==="PartialKeyAttribute"){
        if(connectedLinkCount === 0) {
            let errorName = "Lỗi thuộc tính " + element.paragraph + " đứng một mình";
            if(!element.paragraph) errorName += " và không có nội dung";
            return errorName;
            //console.log(element.paragraph + array_errors[2]);    // Lỗi thuộc tính đứng một mình
        }

        if (connectedLinkCount >1) {
            let errorName = "Lỗi thuộc tính " + element.paragraph + " liên kết tới nhiều thực thể hoặc mối kết hợp";
            if(!element.paragraph) errorName += " và không có nội dung";
            return errorName;
            //console.log(element.paragraph + array_errors[3]);    // Lỗi thuộc tính liên kết tới nhiều thực thể hoặc mối kết hợp
        }
    }

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

    // let array_errors = [' Loi moi ket hop dung mot minh',
    // ' Loi moi ket hop chi co mot lien ket toi',
    // ' Loi thuoc tinh dung mot minh',
    // ' Loi thuoc tinh ket hop toi nhieu thuc the hoac moi ket hop',
    // ' Loi moi ket hop yeu ket hop voi thuc the yeu nhung lai ve lien ket don',
    // ' Loi moi ket hop yeu ket hop voi thuc the manh nhung lai ve lien ket doi',
    // ' Loi moi ket hop manh voi thuc the manh nhung lai ve lien ket doi',
    // ' Loi moi ket hop manh voi thuc the yeu nhung lai ve lien ket doi',
    // ' Loi hai thuc the lien ket truc tiep voi nhau ma khong co moi ket hop'];

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
        //console.log(array_errors[4] + " giua moi ket hop , thuc the la " + ele1.paragraph + " va " + ele2.paragraph);
    }

    else if(ele2.type==="IdentifyingRelationship" && ele1.type==="WeakEntity" && link.type==="PartialParticipation") {
        return "Lỗi mối kết hợp yếu " + ele2.paragraph + " với thực thể yếu " + ele1.paragraph + " nhưng lại vẽ liên kết đơn";
        //console.log(array_errors[4] + " giua moi ket hop , thuc the la " + ele1.paragraph + " va " + ele2.paragraph);
    }

    // Lỗi mối kết hợp yếu với thực thể mạnh nhưng lại vẽ liên kết đôi
    if(ele1.type==="IdentifyingRelationship" && ele2.type==="Entity" && link.type==="TotalParticipation") {
        return "Lỗi mối kết hợp yếu " + ele1.paragraph + " với thực thể mạnh " + ele2.paragraph + " nhưng lại vẽ liên kết đôi";
        //console.log(array_errors[5] + " giua moi ket hop , thuc the la " + ele1.paragraph + " va " + ele2.paragraph);
    }

    else if(ele2.type==="IdentifyingRelationship" && ele1.type==="Entity" && link.type==="TotalParticipation") {
        return "Lỗi mối kết hợp yếu " + ele2.paragraph + " với thực thể mạnh " + ele1.paragraph + " nhưng lại vẽ liên kết đôi";
        //console.log(array_errors[5] + " giua moi ket hop , thuc the la " + ele1.paragraph + " va " + ele2.paragraph);
    }

    // Lỗi mối kết hợp mạnh với thực thể mạnh nhưng lại vẽ liên kết đôi
    if(ele1.type==="Relationship" && ele2.type==="Entity" && link.type==="TotalParticipation") {
        return "Lỗi mối kết hợp mạnh " + ele1.paragraph + " với thực thể mạnh " + ele2.paragraph + " nhưng lại vẽ liên kết đôi";
        //console.log(array_errors[6] + " giua moi ket hop , thuc the la " + ele1.paragraph + " va " + ele2.paragraph);
    }

    else if(ele2.type==="Relationship" && ele1.type==="Entity" && link.type==="TotalParticipation") {
        return "Lỗi mối kết hợp mạnh " + ele2.paragraph + " với thực thể mạnh " + ele1.paragraph + " nhưng lại vẽ liên kết đôi";
        //console.log(array_errors[6] + " giua moi ket hop , thuc the la " + ele1.paragraph + " va " + ele2.paragraph);
    }

    // Lỗi mối kết hợp mạnh với thực thể yếu nhưng lại vẽ liên kết đôi
    if(ele1.type==="Relationship" && ele2.type==="WeakEntity" && link.type==="TotalParticipation") {
        return "Lỗi mối kết hợp mạnh " + ele1.paragraph + " với thực thể yếu " + ele2.paragraph + " nhưng lại vẽ liên kết đôi";
        //console.log(array_errors[7] + " giua moi ket hop , thuc the la " + ele1.paragraph + " va " + ele2.paragraph);
    }

    else if(ele2.type==="Relationship" && ele1.type==="WeakEntity" && link.type==="TotalParticipation") {
        return "Lỗi mối kết hợp mạnh " + ele2.paragraph + " với thực thể yếu " + ele1.paragraph + " nhưng lại vẽ liên kết đôi";
        //console.log(array_errors[7] + " giua moi ket hop , thuc the la " + ele1.paragraph + " va " + ele2.paragraph);
    }

    // Lỗi hai thực thể liên kết trực tiếp với nhau mà không có mối kết hợp
    if((ele1.type==="Entity" || ele1.type==="WeakEntity" || ele1.type==="AssociativeEntity") && (ele2.type==="Entity" || ele2.type==="WeakEntity" || ele2.type==="AssociativeEntity")) {
        return "Lỗi hai thực thể " + ele1.paragraph + " và " + ele2.paragraph + " liên kết trực tiếp với nhau mà không có mối kết hợp";
        //console.log(array_errors[8] + " giua hai thuc the " + ele1.paragraph+" va "+ ele2.paragraph);
    }

    // Lỗi hai mối kết hợp liên kết trực tiếp với nhau mà không có mối kết hợp
    if ((ele1.type==="Relationship" || ele1.type==="IdentifyingRelationship" || ele1.type==="ISA") && (ele2.type==="Relationship" || ele2.type==="IdentifyingRelationship" || ele2.type==="ISA")) {
        return "Lỗi hai mối kết hợp " + ele1.paragraph + " và " + ele2.paragraph + " liên kết trực tiếp với nhau";
    }

    // Lỗi thực thể liên kết với thuộc tính nhưng lại vẽ liên kết đôi
    if ((ele1.type==="Entity" || ele1.type==="WeakEntity" || ele1.type==="AssociativeEntity") && (ele2.type==="Attribute" || ele2.type==="Normal" || ele2.type==="Key" || ele2.type==="Multivalued" || ele2.type==="Derived" || ele2.type==="PartialKeyAttribute")) {
        if (link.type==="TotalParticipation")
            return "Lỗi thực thể " + ele1.paragraph + " liên kết với thuộc tính  " + ele2.paragraph + " nhưng lại vẽ liên kết đôi";
    }

    if ((ele2.type==="Entity" || ele2.type==="WeakEntity" || ele2.type==="AssociativeEntity") && (ele1.type==="Attribute" || ele1.type==="Normal" || ele1.type==="Key" || ele1.type==="Multivalued" || ele1.type==="Derived" || ele1.type==="PartialKeyAttribute")) {
        if (link.type==="TotalParticipation")
            return "Lỗi thực thể " + ele2.paragraph + " liên kết với thuộc tính  " + ele1.paragraph + " nhưng lại vẽ liên kết đôi";
    }

    // Lỗi mối kết hợp liên kết với thuộc tính nhưng lại vẽ liên kết đôi
    if ((ele1.type==="Relationship" || ele1.type==="IdentifyingRelationship" || ele1.type==="ISA") && (ele2.type==="Attribute" || ele2.type==="Normal" || ele2.type==="Key" || ele2.type==="Multivalued" || ele2.type==="Derived" || ele2.type==="PartialKeyAttribute")) {
        if (link.type==="TotalParticipation")
            return "Lỗi mối kết hợp" + ele1.paragraph + " liên kết với thuộc tính  " + ele2.paragraph + " nhưng lại vẽ liên kết đôi";
    }

    if ((ele2.type==="Relationship" || ele2.type==="IdentifyingRelationship" || ele2.type==="ISA") && (ele1.type==="Attribute" || ele1.type==="Normal" || ele1.type==="Key" || ele1.type==="Multivalued" || ele1.type==="Derived" || ele1.type==="PartialKeyAttribute")) {
        if (link.type==="TotalParticipation")
            return "Lỗi mối kết hợp" + ele2.paragraph + " liên kết với thuộc tính  " + ele1.paragraph + " nhưng lại vẽ liên kết đôi";
    }

    // Lỗi liên kết giữa thực thể và mối kết hợp không có cardinal
    if ((ele1.type==="Entity" || ele1.type==="WeakEntity" || ele1.type==="AssociativeEntity") && (ele2.type==="Relationship" || ele2.type==="IdentifyingRelationship" || ele2.type==="ISA")) {
        if (link.paragraph === "")
            return "Lỗi thực thể " + ele1.paragraph + " liên kết với thuộc tính  " + ele2.paragraph + " mà không có cardinal";
    }

    if ((ele2.type==="Entity" || ele2.type==="WeakEntity" || ele2.type==="AssociativeEntity") && (ele1.type==="Relationship" || ele1.type==="IdentifyingRelationship" || ele1.type==="ISA")) {
        if (link.paragraph === "")
            return "Lỗi thực thể " + ele2.paragraph + " liên kết với thuộc tính  " + ele1.paragraph + " mà không có cardinal";
    }
    
    return "";
}