// Search field - name & roll number
$(document).ready(function () {
  // Define an object to store the search box input events
  var searchBoxes = {
    '#search-box-name': ':nth-child(1)',
    '#search-box-rollno': ':nth-child(2)'
  };
  // Bind the input event for each search box
  $.each(searchBoxes, function (selector, column) {
    $(selector).on('click', function (event) {
      event.stopPropagation(); // click event only handle by search box and not affect the parent element events
    }).on('input', function () {
      var searchText = $(this).val().toLowerCase();
      var anyRowsDisplayed = false;
      $('table tbody tr').each(function () {
        var cellText = $(this).find('td' + column).text().toLowerCase();
        if (cellText.indexOf(searchText) !== -1) {
          $(this).show();
          anyRowsDisplayed = true;
        } else {
          $(this).hide();
        }
      });
      if (!anyRowsDisplayed) {
        $('table tbody').append('<tr><td colspan="9" style="text-align:center;">No matching records found</td></tr>');
      } else {
        $('table tbody tr:contains("No matching records found")').remove();
      }
    });
  });
});
//Datatable using jquery ajax
$(document).ready(function () {
  // Declare global variable stud_id and set its initial value to 0
  var stud_id = 0;
  let totalRecords = 0;
  
  //Disable the future dates in date picker:
  const today = new Date().toISOString().split('T')[0];
  $('#date-of-joining').attr('max', today);
  $('#exampleModal').on('hidden.bs.modal', function () {
    resetModal();
  });
  // Function to reset the modal after saving data
  function resetModal() {
    var form = document.getElementById("add-student-form");
    form.reset();
    form.classList.remove("was-validated");
  }
  // Data tables used 2 configuration options - to define the appearance and behaviours of table columns
  var table = $('#dtBasicExample').DataTable({
    processing: true,
    serverSide: true,
    ajax: {
      // Getting URL from Fake API Server in github
      url: 'https://my-json-server.typicode.com/VinusreeJeyasankar/Server2/students',
      type: 'GET',
      data: function (d) {
        var searchValue = d.search.value;
        d._start = d.start; // Add this line to set the start parameter in the request data object
        d._limit = d.length; // Add this line to set the limit parameter
        d._sort = d.order.length > 0 ? d.columns[d.order[0].column].data : undefined;
        d._order = d.order.length > 0 ? d.order[0].dir : undefined;
        d.q = searchValue; // Pass the search value to the data function using d.q
        return d;
      },
      dataType: 'json',
      dataSrc: function (json) {
        return json.slice(0, table.page.len()); // Add this line to limit the number of records returned based on the number of records selected by the user
      },
      xhr: function (xhr) {
        // Create a new XMLHttpRequest object to access response headers
        var xhr = new XMLHttpRequest();
        xhr.addEventListener('readystatechange', function () {
          if (this.readyState === 4 && this.status === 200) {
            // Get the 'X-Total-Count' header from the response and update totalRecords
            var totalCountHeader = xhr.getResponseHeader('X-Total-Count');
            if (totalCountHeader) {
              totalRecords = parseInt(totalCountHeader);
            }
          }
        });
        return xhr
      }
    },
    // columns - to get the data from API server
    columns: [
      { data: "id" },
      { data: "Name" },
      { data: "Roll-No" },
      { data: "Age" },
      { data: "Gender" },
      { data: "Course" },
      { data: "Course-Duration" },
      { data: "Fees" },
      {
        data: "Status",
        render: function (data, type, row) {
          if (data === "Paid") {
            return "<span class='bg-success text-white p-2 status paid' >" + data + "</span>";
          } else if (data === "Not-Paid") {
            return "<span class='bg-danger text-white p-2 status'>" + data + "</span>";
          } else {
            return data;
          }
        }
      },
      { data: "Date-of-joining" },
      {
        data: null,
        render: function (data, type, row) {
          return '<button class="fa fa-edit fa-sm edit-btn">Edit</button>' + '<button class="fa fa-trash-o fa-sm delete-btn">Delete</button>';
        }
      }
    ],
    // columns-defs(defines properties of 1/more columns), here it is used to align the columns 
    columnDefs: [
      {
        targets: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], //columns (col index value) are aligned to center
        className: "dt-body-center"
      }
    ],
    dom: '<"top"lf<"custom-button">r>t<"bottom"ip>',//create button custom style with datatable structure
    pageLength: 10,
    paging: true,
    searching: true,
    lengthMenu: [10, 25, 50], // Add this line to specify the available options for the number of records to be displayed per page
    // lengthChange: true, // Add this line to enable the ability for the user to change the number of records per page
    lengthChange: true,
    info: true,
    drawCallback: function (settings) {
      var api = this.api();
      var info = api.page.info();
      var currentPageRecords = api.rows({ page: 'current' }).count();
      var lastRecordIndex = info.end;
      var $pageButtons = $('.paginate_button:not(.previous, .next)');
      var $nextButton = $('.paginate_button.next');
      var $previousButton = $('.paginate_button.previous');
      var totalPages = Math.ceil(totalRecords / api.page.len()); // total records is total entries count and api.page.len() is entries per page

      if (currentPageRecords === 0 || lastRecordIndex === totalRecords - 1) {
        $pageButtons.hide();
        $nextButton.addClass('disabled');
      } else {
        $pageButtons.show();
        $nextButton.removeClass('disabled');
      }
      // Disable or enable previous and next buttons based on current page
      if (info.page === 0) {
        $previousButton.addClass('disabled');
      } else {
        $previousButton.removeClass('disabled');
      }
      if (info.page === totalPages - 1) {
        $nextButton.addClass('disabled');
      } else {
        $nextButton.removeClass('disabled');
      }
      // Hide page buttons after the last record page
      $pageButtons.each(function () {
        var $pageButton = $(this);
        var pageNum = $pageButton.text() - 1; // page numbers start from 0
        if (pageNum > totalPages - 1) {
          $pageButton.hide();
        } else {
          $pageButton.show();
        }
      });
      // Update info text
      var startIndex = info.start + 1;
      var endIndex = info.start + table.rows().count();
      var infoText = 'Showing ' + startIndex + ' to ' + endIndex + ' of ' + totalRecords + ' entries';
      $('.dataTables_info').text(infoText);
    }
  });
  // Create button 
  $(".custom-button").html('<button id="customButton" class="btn btn-success" data-bs-toggle="modal" data-bs-target="#exampleModal"><i class="fa fa-plus"></i> Create Record</button>');
  // reset modal after updating
  function resetModal() {
    var form = document.getElementById("add-student-form");
    form.reset();
    form.classList.remove("was-validated");
  
    // Hide the update button and set the title to 'Create Record'
    $('#update-student-btn').hide();
    $('#save-student-btn').show();
    $('#exampleModalLabel').text('Create Record');
  }
  // edit button 
  $('#dtBasicExample tbody').on('click', '.edit-btn', function () {
    var rowIndex = table.cell($(this).closest('td, th')).index().row;
    var rowData = table.row(rowIndex).data();
    // Show the Update button and hide the Create button
    $('#save-student-btn').hide();
    $('#update-student-btn').show();
    // Convert date format from "dd/mm/yyyy" to "yyyy-mm-dd"
    var dateParts = rowData['Date-of-joining'].split("/");
    var newDate = dateParts[2] + "-" + dateParts[1] + "-" + dateParts[0];
    // Populate edit form fields with data
    stud_id = rowData.id; // Set stud_id to the ID of the student being edited
    $('#stud_name').val(rowData.Name);
    $('#roll-no').val(rowData['Roll-No']);
    $('#age').val(rowData.Age);
    $('#gender').val(rowData.Gender);
    $('#course').val(rowData.Course);
    $('#course-duration').val(rowData['Course-Duration']);
    $('#fees').val(rowData.Fees);
    $('#stud_status').val(rowData.Status);
    $('#date-of-joining').val(newDate);
    // Set the title of the modal to 'Update Student Record'
    $('#exampleModalLabel').text('Update Student Record');
    // Show edit modal
    $('#exampleModal').modal('show');
  });
  // delete button
  $('#dtBasicExample tbody').on('click', '.delete-btn', function () {
    var rowData = table.row($(this).parents('tr')).data();
    var stud_id = rowData.id;
    // Ask for confirmation before deleting the data
    if (confirm("Are you sure you want to delete this record?")) {
      // Send DELETE request to the API
      $.ajax({
        url: "https://my-json-server.typicode.com/VinusreeJeyasankar/Server2/students/" + stud_id,
        type: "DELETE",
        success: function(response) {
          console.log("Data deleted successfully!");
          // Remove the row from the table
          table.row($(this).parents('tr')).remove();
        },
        error: function(error) {
          console.error("Error deleting data:", error);
        }
      });
    }
  });
  // onclick function for the next button
  $('#dtBasicExample_paginate').on('click', '.next', function () {
    var $nextButton = $(this);
    if (!$nextButton.hasClass('disabled')) {
      var currentPage = table.page();
      table.page(currentPage + 1).draw(false);
    }
  });
  $("#save-student-btn").click(function(event) {
    // Prevent the default form submission behavior
    event.preventDefault();
    // Get the form element
    var form = document.getElementById("add-student-form");
    // Check if the form is valid
    if (form.checkValidity()) {
      // The code for creating a record
      // Create data object with form field values
    var data = {
      name: $("#stud_name").val(),
      rollno: $("#roll-no").val(),
      age: $("#age").val(),
      gender: $("#gender").val(),
      course: $("#course").val(),
      courseDuration: $("#courseDuration").val(),
      fees: $("#fees").val(),
      status: $("#stud_status").val(),
      dateOfJoining: $("#date-of-joining").val()
    };
    // Send data to the API using POST request
    $.ajax({
        url: "https://my-json-server.typicode.com/VinusreeJeyasankar/Server2/students",
        type: "POST",
        data: JSON.stringify(data),
        contentType: "application/json",
        success: function(response) {
          console.log("Data saved successfully!");
          // Close the modal after updating the data (optional)
          $("#exampleModal").modal("hide"); 
          // Reset the modal
          resetModal();
        },
        error: function(error) {
            console.error("Error saving data:", error);
        }
    });
    } else {
      // Display validation messages
      form.reportValidity();
    }
  });
  $("#update-student-btn").click(function(event){
    // Prevent the default form submission behavior
    event.preventDefault();
    // Get the form element
    var form = document.getElementById("add-student-form");
    // Check if the form is valid
    if (form.checkValidity()) {
      // The code for updating a record
      // Create data object with form field values
    var data = {
      name: $("#stud_name").val(),
      rollno: $("#rollno").val(),
      age: $("#age").val(),
      gender: $("#gender").val(),
      course: $("#course").val(),
      courseDuration: $("#courseDuration").val(),
      fees: $("#fees").val(),
      stud_status: $("#stud_status").val(),
      dateOfJoining: $("#date-of-joining").val()
    };
    // Send data to the API using PUT request
    $.ajax({
        url: "https://my-json-server.typicode.com/VinusreeJeyasankar/Server2/students/" + stud_id,
        type: "PUT",
        data: JSON.stringify(data),
        contentType: "application/json",
        success: function(response) {
          console.log("Data updated successfully!");
          // Close the modal after updating the data (optional)
          $("#exampleModal").modal("hide"); 
        },
        error: function(error) {
            console.error("Error updating data:", error);
        }
    });
    } else {
      // Display validation messages
      form.reportValidity();
    }
  });
});