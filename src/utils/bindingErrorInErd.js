export function checkElementBindingError(element, linkJSON, bindingErrorList) {
    if (!linkJSON || !element) return;

    let array_errors = [' Loi moi ket hop dung mot minh',
    ' Loi moi ket hop chi co mot lien ket toi',
    ' Loi thuoc tinh dung mot minh',
    ' Loi thuoc tinh ket hop toi nhieu thuc the hoac moi ket hop',
    ' Loi moi ket hop yeu ket hop voi thuc the yeu nhung lai ve lien ket don',
    ' Loi moi ket hop yeu ket hop voi thuc the manh nhung lai ve lien ket doi',
    ' Loi moi ket hop manh voi thuc the manh nhung lai ve lien ket doi',
    ' Loi moi ket hop manh voi thuc the yeu nhung lai ve lien ket doi',
    ' Loi hai thuc the lien ket truc tiep voi nhau ma khong co moi ket hop'];
    //let _bindingErrorList = bindingErrorList.slice();
    let connectedLinkCount = 0;
    linkJSON.links.forEach((link) => {
        if(link && (link.sourceId == element.id || link.targetId==element.id)) {
            connectedLinkCount++;
            //alert("" + linkConnectedToElement.sourceId + "\t" + linkConnectedToElement.targetId + "\t" + element.paragraph);
        }
    })
    
    //alert(linkJSON.links.length);

    // Lỗi mối kết hợp đứng một mình hoặc có một liên kết tới
    if(element.type=="Relationship" || element.type=="IdentifyingRelationship"){
        if(connectedLinkCount==0){
            bindingErrorList.push("Lỗi mối kết hợp " + element.paragraph + " đứng một mình")
            //console.log(element.paragraph + array_errors[0]);   // Lỗi mối kết hợp đứng một mình
        } 

        if(connectedLinkCount==1){
            bindingErrorList.push("Lỗi mối kết hợp " + element.paragraph + " chỉ có một liên kết tới")
            //console.log(element.paragraph + array_errors[1]);   // Lỗi mối kết hợp chỉ có một liên kết tới
        }
    }

    // Lỗi thuộc tính đứng một mình hoặc liên kết tới nhiều thực thể (mối kết hợp)
    if(element.type=="Attribute" || element.type=="Normal" || element.type=="Key" || element.type=="Multivalued" || element.type=="Derived"){
        if(connectedLinkCount == 0) {
            bindingErrorList.push("Lỗi thuộc tính " + element.paragraph + " đứng một mình")
            //console.log(element.paragraph + array_errors[2]);    // Lỗi thuộc tính đứng một mình
        }

        if (connectedLinkCount >1) {
            bindingErrorList.push("Lỗi thuộc tính " + element.paragraph + " liên kết tới nhiều thực thể hoặc mối kết hợp")
            //console.log(element.paragraph + array_errors[3]);    // Lỗi thuộc tính liên kết tới nhiều thực thể hoặc mối kết hợp
        }
    }

    return bindingErrorList;
}

export function checkLinkBindingError(link, elementJSON, bindingErrorList) {
    if (!elementJSON || !link) return;

    let array_errors = [' Loi moi ket hop dung mot minh',
    ' Loi moi ket hop chi co mot lien ket toi',
    ' Loi thuoc tinh dung mot minh',
    ' Loi thuoc tinh ket hop toi nhieu thuc the hoac moi ket hop',
    ' Loi moi ket hop yeu ket hop voi thuc the yeu nhung lai ve lien ket don',
    ' Loi moi ket hop yeu ket hop voi thuc the manh nhung lai ve lien ket doi',
    ' Loi moi ket hop manh voi thuc the manh nhung lai ve lien ket doi',
    ' Loi moi ket hop manh voi thuc the yeu nhung lai ve lien ket doi',
    ' Loi hai thuc the lien ket truc tiep voi nhau ma khong co moi ket hop'];

    let ele1;
    let ele2;
    elementJSON.elements.forEach((element)=>{
        if(element && element.id==link.sourceId){
            ele1=element;
        }

        if(element && element.id==link.targetId){
            ele2=element;
        }
    })
    if (!ele1 || !ele2) return bindingErrorList;

    // Lỗi mối kết hợp yếu với thực thể yếu nhưng lại vẽ liên kết đơn
    if(ele1.type=="IdentifyingRelationship" && ele2.type=="WeakEntity" && link.type=="PartialParticipation") {
        bindingErrorList.push("Lỗi mối kết hợp yếu " + ele1.paragraph + " với thực thể yếu " + ele2.paragraph + " nhưng lại vẽ liên kết đơn")
        //console.log(array_errors[4] + " giua moi ket hop , thuc the la " + ele1.paragraph + " va " + ele2.paragraph);
    }

    else if(ele2.type=="IdentifyingRelationship" && ele1.type=="WeakEntity" && link.type=="PartialParticipation") {
        bindingErrorList.push("Lỗi mối kết hợp yếu " + ele2.paragraph + " với thực thể yếu " + ele1.paragraph + " nhưng lại vẽ liên kết đơn")
        //console.log(array_errors[4] + " giua moi ket hop , thuc the la " + ele1.paragraph + " va " + ele2.paragraph);
    }

    // Lỗi mối kết hợp yếu với thực thể mạnh nhưng lại vẽ liên kết đôi
    if(ele1.type=="IdentifyingRelationship" && ele2.type=="Entity" && link.type=="TotalParticipation") {
        bindingErrorList.push("Lỗi mối kết hợp yếu " + ele1.paragraph + " với thực thể mạnh " + ele2.paragraph + " nhưng lại vẽ liên kết đôi")
        //console.log(array_errors[5] + " giua moi ket hop , thuc the la " + ele1.paragraph + " va " + ele2.paragraph);
    }

    else if(ele2.type=="IdentifyingRelationship" && ele1.type=="Entity" && link.type=="TotalParticipation") {
        bindingErrorList.push("Lỗi mối kết hợp yếu " + ele2.paragraph + " với thực thể mạnh " + ele1.paragraph + " nhưng lại vẽ liên kết đôi")
        //console.log(array_errors[5] + " giua moi ket hop , thuc the la " + ele1.paragraph + " va " + ele2.paragraph);
    }

    // Lỗi mối kết hợp mạnh với thực thể mạnh nhưng lại vẽ liên kết đôi
    if(ele1.type=="Relationship" && ele2.type=="Entity" && link.type=="TotalParticipation") {
        bindingErrorList.push("Lỗi mối kết hợp mạnh " + ele1.paragraph + " với thực thể mạnh " + ele2.paragraph + " nhưng lại vẽ liên kết đôi")
        //console.log(array_errors[6] + " giua moi ket hop , thuc the la " + ele1.paragraph + " va " + ele2.paragraph);
    }

    else if(ele2.type=="Relationship" && ele1.type=="Entity" && link.type=="TotalParticipation") {
        bindingErrorList.push("Lỗi mối kết hợp mạnh " + ele2.paragraph + " với thực thể mạnh " + ele1.paragraph + " nhưng lại vẽ liên kết đôi")
        //console.log(array_errors[6] + " giua moi ket hop , thuc the la " + ele1.paragraph + " va " + ele2.paragraph);
    }

    // Lỗi mối kết hợp mạnh với thực thể yếu nhưng lại vẽ liên kết đôi
    if(ele1.type=="Relationship" && ele2.type=="WeakEntity" && link.type=="TotalParticipation") {
        bindingErrorList.push("Lỗi mối kết hợp mạnh " + ele1.paragraph + " với thực thể yếu " + ele2.paragraph + " nhưng lại vẽ liên kết đôi")
        //console.log(array_errors[7] + " giua moi ket hop , thuc the la " + ele1.paragraph + " va " + ele2.paragraph);
    }

    else if(ele2.type=="Relationship" && ele1.type=="WeakEntity" && link.type=="TotalParticipation") {
        bindingErrorList.push("Lỗi mối kết hợp mạnh " + ele2.paragraph + " với thực thể yếu " + ele1.paragraph + " nhưng lại vẽ liên kết đôi")
        //console.log(array_errors[7] + " giua moi ket hop , thuc the la " + ele1.paragraph + " va " + ele2.paragraph);
    }

    // Lỗi hai thực thể liên kết trực tiếp với nhau mà không có mối kết hợp
    if((ele1.type=="Entity" && ele2.type=="Entity") || (ele1.type=="Entity" && ele2.type=="WeakEntity") || (ele1.type=="WeakEntity" && ele2.type=="Entity") || (ele1.type=="WeakEntity" && ele2.type=="WeakEntity")) {
        bindingErrorList.push("Lỗi hai thực thể " + ele1.paragraph + " và " + ele2.paragraph + " liên kết trực tiếp với nhau mà không có mối kết hợp")
        //console.log(array_errors[8] + " giua hai thuc the " + ele1.paragraph+" va "+ ele2.paragraph);
    }
    return bindingErrorList;
}