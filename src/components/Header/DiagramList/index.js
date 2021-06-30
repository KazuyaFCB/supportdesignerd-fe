import React, { useEffect, useState } from "react";
import { Link, Redirect } from "react-router-dom";
import $ from "jquery";
import "./index.css";
import axios from "../../../utils/axios";

export default function DiagramList({
  currentUser,
  diagramList,
  setDiagramList,
  setElementJSON,
  setLinkJSON,
  setImgSrc,
  setOpenLoading,
}) {
  let [diagramListView, setDiagramListView] = useState(null);
  let [paginationView, setPaginationView] = useState(null);

  const numShownPage = 3;
  const numElementInPage = 5;
  let [currentPage, setCurrentPage] = useState(-1);
  const startPage = 1;
  let endPage = 1;
  let currentStartPage = 1;
  let currentEndPage = numShownPage;

  useEffect(async () => {
    if (currentUser) {
      setOpenLoading(true);
      const api = await axios.get(
        "/api/erds/find-erd-by-userIdCreated/" + currentUser._id
      );
      setOpenLoading(false);
      setDiagramList(api.data.erdList);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      if (diagramList && diagramList.length > 0) {
        setCurrentPage(1);
      } else {
        setCurrentPage(-1);
      }
    }
  }, [diagramList]);

  useEffect(() => {
    if (currentUser) {
      if (currentPage > -1) {
        endPage = parseInt((diagramList.length - 1) / numElementInPage) + 1;
        currentStartPage =
          parseInt((currentPage - 1) / numShownPage) * numShownPage + 1;
        currentEndPage =
          endPage < currentStartPage + numShownPage - 1
            ? endPage
            : currentStartPage + numShownPage - 1;
        renderDiagramListView();
        renderPaginationView();
      } else {
        setDiagramListView(
          <tr>
            <td colSpan="4" align="center">
              Not found diagram
            </td>
          </tr>
        );
      }
    }
  }, [currentPage]);

  function renderDiagramListView() {
    let result = [],
      i,
      j;
    if (diagramList.length == 0) return;
    for (
      i = (currentPage - 1) * numElementInPage, j = 0;
      i < diagramList.length && j < numElementInPage;
      i++, j++
    ) {
      let viewId = "v-" + i;
      let deleteId = "d-" + i;
      result.push(
        <tr>
          <td>{i + 1}</td>
          <td>{diagramList[i].erdName}</td>
          <td>{diagramList[i].createdDate}</td>
          <td>{diagramList[i].updatedDate}</td>
          <td>
            <Link to={"/json-to-diagram"}>
              {/* <a onClick={(e) => viewDiagram(e.currentTarget.id)} id={viewId} class="edit" title="Edit" data-toggle="tooltip"><i class="material-icons">&#xE417;</i></a> */}
              <a
                onClick={(e) => viewDiagram(e.currentTarget.id)}
                id={viewId}
                class="edit"
                title="Edit"
                data-toggle="tooltip"
              >
                <i class="material-icons">&#xE254;</i>
              </a>
            </Link>
            <a
              onClick={(e) => deleteDiagram(e.currentTarget.id)}
              href=""
              id={deleteId}
              class="delete"
              title="Delete"
              data-toggle="tooltip"
            >
              <i class="material-icons">&#xE872;</i>
            </a>
          </td>
        </tr>
      );
    }

    // diagramList.forEach((diagram, index) => {
    //     result.push(

    //     )
    // });
    setDiagramListView(result);
  }

  function renderPaginationView() {
    let result = [];
    if (currentStartPage == startPage)
      result.push(
        <li class="page-item disabled">
          <a onClick={() => goToPreviousPagination()} class="page-link">
            Previous
          </a>
        </li>
      );
    else
      result.push(
        <li class="page-item">
          <a onClick={() => goToPreviousPagination()} class="page-link">
            Previous
          </a>
        </li>
      );
    for (let i = currentStartPage; i <= currentEndPage; i++) {
      if (i == currentPage)
        result.push(
          <li class="page-item active">
            <a onClick={() => goToPage(i)} class="page-link">
              {i}
            </a>
          </li>
        );
      else
        result.push(
          <li class="page-item">
            <a onClick={() => goToPage(i)} class="page-link">
              {i}
            </a>
          </li>
        );
    }
    if (currentEndPage == endPage)
      result.push(
        <li class="page-item disabled">
          <a onClick={() => goToNextPagination()} class="page-link">
            Next
          </a>
        </li>
      );
    else
      result.push(
        <li class="page-item">
          <a onClick={() => goToNextPagination()} class="page-link">
            Next
          </a>
        </li>
      );
    setPaginationView(result);
  }

  function goToPreviousPagination() {
    if (currentStartPage > numShownPage) {
      currentStartPage = currentStartPage - numShownPage;
      currentEndPage = currentStartPage + numShownPage - 1;
      setCurrentPage(currentStartPage);
    }
  }

  function goToNextPagination() {
    if (currentStartPage + numShownPage <= endPage) {
      setCurrentPage(currentStartPage + numShownPage);
    }
  }

  function goToPage(page) {
    setCurrentPage(page);
  }

  function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms));}

  async function viewDiagram(viewId) {
    let index = viewId.substr(2);
    const api = await axios.get('/api/erds/find-erd-by-id/' + diagramList[index]._id);
    sessionStorage.setItem("currentViewedErd", JSON.stringify(diagramList[index]));
    setElementJSON(api.data.elementJSON);
    setLinkJSON(api.data.linkJSON);
    setImgSrc(api.data.imgSrc);
    //await sleep(1500);
    //window.location.href = "/json-to-diagram";
  }

  async function deleteDiagram(deleteId) {
    let index = deleteId.substr(2);
    setOpenLoading(true);
    const api = await axios.get(
      "/api/erds/delete-erd-by-id/" + diagramList[index]._id
    );
    setOpenLoading(false);
    let tmpDiagramList = diagramList.slice();
    tmpDiagramList.splice(index, 1);
    setDiagramList(tmpDiagramList);
    setCurrentPage(-1);
    if (api.data.status) {
      alert("Delete diagram successfully");
    }
  }

  return (
    <html>
      {/* <head>
        <title>Diagram List</title>
      </head> */}
      <body>
        <div class="container">
          <h2>Diagram List</h2>
          <div class="table-responsive">
            <div class="table-wrapper">
              <table class="table table-bordered">
                <thead
                  style={{
                    backgroundColor: "lavender",
                    color: "green",
                    fontWeight: "bold",
                  }}
                >
                  <tr>
                    <th>#</th>
                    <th>
                      {/* ERD Name <i class="fa fa-sort"></i> */}
                      ERD Name
                    </th>
                    <th>Created date</th>
                    <th>Updated date</th>
                  </tr>
                </thead>
                <tbody>{diagramListView}</tbody>
              </table>
              <div class="clearfix">
                <div class="hint-text">
                  Showing{" "}
                  <b>
                    {numElementInPage < diagramList.length
                      ? numElementInPage
                      : diagramList.length}
                  </b>{" "}
                  out of <b>{diagramList.length}</b> entries
                </div>
                <ul class="pagination">{paginationView}</ul>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
