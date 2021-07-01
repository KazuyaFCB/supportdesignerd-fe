import React, { useState } from "react";
import "./index.css";
import DiagramList from "./../Header/DiagramList/index";

function Guide({ inJsonPage }) {
  const [isShowing, setIsShowing] = useState("off");

  return (
    <div className="help-container">
      <div className="switch-container">
        <h5>Hướng dẫn</h5>
        <label class="switch">
          <input
            checked={isShowing === "on"}
            type="checkbox"
            onClick={() => setIsShowing(isShowing === "off" ? "on" : "off")}
          />
          <span
            class={isShowing === "on" ? "slider round" : "slider round hide"}
          >
            {isShowing === "on" ? "Hiển thị" : "Ẩn"}
          </span>
        </label>
      </div>
      {isShowing === "on" && (
        <ul className="help-wrapper">
          {inJsonPage && (
            <React.Fragment>
              <li className="help-items">
                <strong>Element JSON</strong> là phần dữ liệu JSON thể hiện cấu
                trúc của các <strong> thực thể/mối kết hợp/thuộc tính</strong>{" "}
                trên mô hình, có thể chỉnh sửa để thay đổi nội dung của mô hình.
                Bao gồm <strong>{" "} id, tọa độ, thể loại, nội dung, kích cỡ</strong>.
              </li>
              <li className="help-items">
                <strong>Cấu trúc của elementJSON: </strong>
                {`
                { "elements":
                  [{
                    "id":1, "x":0, "y":0,
                    "type":"", "paragraph":"",
                    "width":100,"height":50
                  }]
                }
                `}
              </li>
              <li className="help-items">
                Trong đó <strong>elements</strong> là mảng mà mỗi phần tử của nó là 1 object đại diện cho 
                {" "}<strong>thực thể/mối kết hợp/thuộc tính</strong>
                {" .Còn "}<strong>id, x, y, type, paragraph, width, height</strong>, lần lượt là 
                  <strong>{" "}id, tọa độ, thể loại, nội dung, kích cỡ</strong> của <strong>thực thể/mối kết hợp/thuộc tính{" "}</strong> 
                  trên mô hình. Đồng thời <strong>id</strong> phải bắt đầu từ 1.
                Ngoài ra, <strong>type</strong>
                {` phải là 1 trong các chuỗi sau: `}
                <strong>"Entity", "WeakEntity", "Relationship", "IdentifyingRelationship", 
                "Attribute", "Key", "Multivalued", "Derived", 
                "PartialKeyAttribute", "AssociativeEntity"</strong>.
              </li>
              <li className="help-items">
                <strong>Link JSON</strong> là phần dữ liệu JSON thể hiện của các
                <strong> đường nối </strong> trên mô hình, có thể chỉnh sửa để
                thay đổi nội dung của mô hình. Bao gồm <strong>id, thể loại, nội dung, id đối tượng tại 2 đầu mút</strong>.
              </li>
              <li className="help-items">
                <strong>Cấu trúc của linkJSON: </strong>
                {`
                { "links":
                  [{
                    "id":1,
                    "type":"", "paragraph":"",
                    "sourceId":1,"targetId":2
                  }]
                }
                `}
              </li>
              <li className="help-items">
                Trong đó <strong>links</strong> là mảng mà mỗi phần tử của nó là 1 object đại diện cho 
                {" "}<strong>đường nối</strong>
                {" .Còn "}<strong>id, type, paragraph, sourceId, targetId</strong> lần lượt là 
                  <strong>{" "}id, thể loại, nội dung, id thực thể/mối kết hợp/thuộc tính tại 2 đầu mút
                  của đường nối trên mô hình</strong>. 
                  Đồng thời <strong>id</strong> phải bắt đầu từ 1.
                  Ngoài ra, <strong>type</strong>
                  {` phải là 1 trong các chuỗi sau: `}
                  <strong>"PartialParticipation", "TotalParticipation", "Optional"</strong>.
              </li>
            </React.Fragment>
          )}
          <li className="help-items">
            Để vẽ <strong>thực thể/mối kết hợp/thuộc tính</strong> lên mô hình,
            click vào các{" "}
            <strong>ký hiệu hình chữ nhật/hình thoi/hình elip </strong>
            trên thanh công cụ ở dưới, sẽ có 1 thực thể/mối kết hợp/thuộc tính
            được tạo ở góc trái trên của mô hình.
          </li>
          <li className="help-items">
            Để vẽ <strong>đường nối</strong> giữa 2{" "}
            <strong>thực thể/mối kết hợp/thuộc tính</strong> lên mô hình, click
            vào các <strong>ký hiệu đường nối</strong> trên thanh công cụ. Rồi
            click vào <strong>thực thể/mối kết hợp/thuộc tính THỨ 1 </strong>
            và tiếp đó click vào{" "}
            <strong>thực thể/mối kết hợp/thuộc tính THỨ 2.</strong>
          </li>
          <li className="help-items">
            Khi muốn bỏ chọn một <strong>ký hiệu đường nối</strong> trên thanh
            công cụ, <strong>click chuột vào khoảng trống</strong> trên vùng
            mô hình.
          </li>
          <li className="help-items">
            Khi chỉnh sửa nội dung{" "}
            <strong>thực thể/mối kết hợp/thuộc tính/đường nối </strong>
            thì click đúp chuột vào chúng, rồi nhập nội dung cần sửa, sau đó
            click khoảng trống trên mô hình để mô hình tự động nạp lại nội dung
            đã nhập.
          </li>
          <li className="help-items">
            Khi muốn xóa{" "}
            <strong>thực thể/mối kết hợp/thuộc tính/đường nối</strong> trên
            mô hình thì đưa chuột vào hình vẽ cần xóa, sẽ có{" "}
            <strong>icon "X"</strong> hiện lên, click vào{" "}
            <strong>icon "X"</strong> để xoá hình.
          </li>
          <li className="help-items">
            Trong trường hợp có cảnh báo lỗi chưa điền bảng số, sau đó{" "}
            <strong>đã điền bảng số</strong> cho các liên kết nhưng cảnh báo lỗi
            vẫn xuất hiện, <strong>vui lòng refresh lại trang (ấn F5)</strong>{" "}
            để nạp lại mô hình và điền lại bảng số.
          </li>
          <li className="help-items">
            Để xem nội dung <strong>lỗi logic (nếu có)</strong> của{" "}
            <strong>thực thể/mối kết hợp/thuộc tính/đường nối</strong> thì click
            vào <strong>icon "!"</strong> ở các hình vẽ đó.
          </li>
        </ul>
      )}
    </div>
  );
}

export default Guide;
