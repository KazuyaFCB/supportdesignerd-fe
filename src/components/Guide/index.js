import React, { useState } from "react";
import "./index.css";

function Guide() {
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
            vào các <strong>ký hiệu đường nối</strong> trên thanh nằm ngang. Rồi
            click vào <strong>thực thể/mối kết hợp/thuộc tính THỨ 1 </strong>
            {/* (click khoảng 1-2 lần vào nó đến khi có{" "}
                        <strong>hình chữ nhật màu xanh đè lên</strong>)  */}
            và tiếp đó click vào{" "}
            <strong>thực thể/mối kết hợp/thuộc tính THỨ 2 </strong>
            {/* (click khoảng 1-2 lần vào nó đến khi có{" "} */}
            {/* <strong>đường nối được tạo</strong>). */}
          </li>
          <li className="help-items">
            Lỡ click <strong>ký hiệu đường nối</strong> trên thanh nằm ngang mà{" "}
            <strong>muốn hủy chọn </strong>
            đường nối thì <strong>click chuột vào khoảng trống</strong> trên
            diagram.
          </li>
          <li className="help-items">
            Muốn chỉnh sửa nội dung{" "}
            <strong>thực thể/mối kết hợp/thuộc tính/đường nối </strong>
            thì click đúp chuột vào chúng, rồi nhập nội dung cần sửa và click
            khoảng trống trên diagram.
          </li>
          <li className="help-items">
            Muốn xóa <strong>thực thể/mối kết hợp/thuộc tính/đường nối</strong>{" "}
            trên diagram thì đưa chuột vào hình vẽ cần xóa, sẽ có{" "}
            <strong>icon "X"</strong> hiện lên, click vào{" "}
            <strong>icon "X"</strong> là sẽ xóa được.
          </li>
        </ul>
      )}
    </div>
  );
}

export default Guide;
