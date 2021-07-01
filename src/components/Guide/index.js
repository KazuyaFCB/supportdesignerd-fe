import React, { useState } from "react";
import "./index.css";
import DiagramList from "./../Header/DiagramList/index";

function Guide({ inJsonPage }) {
  const [isShowing, setIsShowing] = useState("on");

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
                <strong>Element JSON</strong> là phần json data thể hiện cấu
                trúc của các <strong> thực thể/mối kết hợp/thuộc tính</strong>{" "}
                trên diagram, có thể chỉnh sửa để thay đổi nội dung của diagram.
                Bao gồm kích thước, thể loại, id, nội dung, vị trí,...
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
                {" .Còn "}<strong>x, y, type, paragraph, width, height, lần lượt là 
                  tọa độ, thể loại, nội dung, kích cỡ của thực thể/mối kết hợp/thuộc tính 
                  trên diagram</strong>
              </li>
              <li className="help-items">
                <strong>Link JSON</strong> là phần json data thể hiện của các
                <strong> đường nối </strong> trên diagram, có thể chỉnh sửa để
                thay đổi nội dung của diagram. Bao gồm thể loại, id, thực thể 1,
                thực thể 2,...
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
                {" .Còn "}<strong>type, paragraph, sourceId, targetId lần lượt là 
                  thể loại, nội dung, id thực thể/mối kết hợp/thuộc tính tại 2 đầu mút
                  của đường nối trên diagram</strong>
              </li>
            </React.Fragment>
          )}
          <li className="help-items">
            Để vẽ <strong>thực thể/mối kết hợp/thuộc tính</strong> lên diagram,
            click vào các{" "}
            <strong>ký hiệu hình chữ nhật/hình thoi/hình elip </strong>
            trên thanh công cụ ở dưới, sẽ có 1 thực thể/mối kết hợp/thuộc tính
            được tạo ở góc trái trên của diagram.
          </li>
          <li className="help-items">
            Để vẽ <strong>đường nối</strong> giữa 2{" "}
            <strong>thực thể/mối kết hợp/thuộc tính</strong> lên diagram, click
            vào các <strong>ký hiệu đường nối</strong> trên thanh công cụ. Rồi
            click vào <strong>thực thể/mối kết hợp/thuộc tính THỨ 1 </strong>
            và tiếp đó click vào{" "}
            <strong>thực thể/mối kết hợp/thuộc tính THỨ 2.</strong>
          </li>
          <li className="help-items">
            Khi muốn bỏ chọn một <strong>ký hiệu đường nối</strong> trên thanh
            công cụ, <strong>click chuột vào khoảng trống</strong> trên vùng
            diagram.
          </li>
          <li className="help-items">
            Khi chỉnh sửa nội dung{" "}
            <strong>thực thể/mối kết hợp/thuộc tính/đường nối </strong>
            thì click đúp chuột vào chúng, rồi nhập nội dung cần sửa, sau đó
            click khoảng trống trên diagram để diagram tự động nạp lại nội dung
            đã nhập.
          </li>
          <li className="help-items">
            Khi muốn xóa{" "}
            <strong>thực thể/mối kết hợp/thuộc tính/đường nối</strong> trên
            diagram thì đưa chuột vào hình vẽ cần xóa, sẽ có{" "}
            <strong>icon "X"</strong> hiện lên, click vào{" "}
            <strong>icon "X"</strong> để xoá hình.
          </li>
          <li className="help-items">
            Trong trường hợp có cảnh báo lỗi chưa điền bảng số, sau đó{" "}
            <strong>đã điền bảng số</strong> cho các liên kết nhưng cảnh báo lỗi
            vẫn xuất hiện, <strong>vui lòng refresh lại trang (ấn F5)</strong>{" "}
            để nạp lại diagram và điền lại bảng số.
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
