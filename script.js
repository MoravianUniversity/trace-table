// Initialize the table with one column and one row
document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.getElementById('tableBody');
    const headerRow = document.getElementById('headerRow');
    const inputsContainer = document.getElementById('inputsContainer');
    const exportBtn = document.getElementById('exportBtn');
    const resetBtn = document.getElementById('resetBtn');
    
    // Function to add a new column
    function addColumn() {
        // Add header cell
        const headerCell = document.createElement('th');
        headerCell.className = 'header-cell';
        headerCell.innerHTML = `
            <input type="text" class="var-name" placeholder="Variable name" />
            <select class="var-type">
                <option value="str">str</option>
                <option value="int">int</option>
            </select>
        `;
        headerRow.appendChild(headerCell);
        
        // Add data cells to all existing rows
        const rows = tableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const dataCell = document.createElement('td');
            dataCell.className = 'data-cell';
            dataCell.innerHTML = '<input type="text" class="cell-input" placeholder="Value" />';
            row.appendChild(dataCell);
        });
        
        // Attach event listeners to the new header inputs
        attachHeaderListeners(headerCell);
        updateStrikethrough();
    }
    
    // Function to add a new row
    function addRow() {
        const row = document.createElement('tr');
        const columnCount = headerRow.querySelectorAll('th').length;
        
        for (let i = 0; i < columnCount; i++) {
            const dataCell = document.createElement('td');
            dataCell.className = 'data-cell';
            dataCell.innerHTML = '<input type="text" class="cell-input" placeholder="Value" />';
            row.appendChild(dataCell);
        }
        
        tableBody.appendChild(row);
        updateStrikethrough();
    }
    
    // Function to update strikethrough styling for cells with values below
    function updateStrikethrough() {
        const rows = tableBody.querySelectorAll('tr');
        rows.forEach((row, rowIndex) => {
            const cells = row.querySelectorAll('.cell-input');
            cells.forEach((input, colIndex) => {
                // Check if any cell below in the same column has a value
                let hasValueBelow = false;
                for (let i = rowIndex + 1; i < rows.length; i++) {
                    const belowRow = rows[i];
                    const belowInput = belowRow.querySelectorAll('.cell-input')[colIndex];
                    if (belowInput && belowInput.value.trim() !== '') {
                        hasValueBelow = true;
                        break;
                    }
                }
                
                // Apply or remove strikethrough
                const wasStrikethrough = input.classList.contains('strikethrough');
                if (hasValueBelow && input.value.trim() !== '') {
                    input.classList.add('strikethrough');
                } else {
                    input.classList.remove('strikethrough');
                }
                
                // Re-validate if strikethrough status changed or if it's strikethrough
                if (wasStrikethrough !== input.classList.contains('strikethrough') || input.classList.contains('strikethrough')) {
                    const headerCell = headerRow.querySelectorAll('th')[colIndex];
                    if (headerCell && input.value.trim() !== '') {
                        const type = headerCell.querySelector('.var-type').value;
                        validateCellInput(input, type);
                    }
                }
            });
        });
    }
    
    // Track if we're currently adding/removing to prevent infinite loops
    let isAddingColumn = false;
    let isAddingRow = false;
    let isRemovingColumn = false;
    let isRemovingRow = false;
    
    // Function to remove a column
    function removeColumn(columnIndex) {
        if (isRemovingColumn) return;
        
        let headers = headerRow.querySelectorAll('th');
        if (columnIndex >= headers.length) {
            return;
        }
        
        isRemovingColumn = true;
        
        // Remove header
        if (headers[columnIndex]) {
            headers[columnIndex].remove();
        }
        
        // Remove cells from all rows
        const rows = tableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells[columnIndex]) {
                cells[columnIndex].remove();
            }
        });
        
        updateStrikethrough();
        
        // Re-validate all variable names after removal (in case a duplicate was removed)
        validateAllVariableNames();
        
        setTimeout(() => {
            isRemovingColumn = false;
        }, 100);
    }
    
    // Function to remove a row
    function removeRow(rowIndex) {
        if (isRemovingRow) return;
        
        let rows = tableBody.querySelectorAll('tr');
        if (rowIndex >= rows.length) {
            return;
        }
        
        isRemovingRow = true;
        
        if (rows[rowIndex]) {
            rows[rowIndex].remove();
        }
        
        updateStrikethrough();
        
        setTimeout(() => {
            isRemovingRow = false;
        }, 100);
    }
    
    // Function to check if a column is empty (header name empty and all cells empty)
    function checkRemoveColumn(columnIndex) {
        let headers = headerRow.querySelectorAll('th');
        const header = headers[columnIndex];
        if (!header) return;
        
        const varNameInput = header.querySelector('.var-name');
        const headerName = varNameInput.value.trim();
        
        // If header name is empty, check all cells
        if (headerName === '') {
            const rows = tableBody.querySelectorAll('tr');
            let hasAnyValue = false;
            
            rows.forEach(row => {
                const cells = row.querySelectorAll('.cell-input');
                const cell = cells[columnIndex];
                if (cell && cell.value.trim() !== '') {
                    hasAnyValue = true;
                }
            });
            
            // If this column has no values, remove it
            if (!hasAnyValue) {
                removeColumn(columnIndex);
            }
        }
    }
    
    // Function to check if a row is empty (all cells empty)
    function checkRemoveRow(rowIndex) {
        const rows = tableBody.querySelectorAll('tr');
        const row = rows[rowIndex];
        if (!row) return;
        
        const cells = row.querySelectorAll('.cell-input');
        let hasAnyValue = false;
        
        cells.forEach(cell => {
            if (cell.value.trim() !== '') {
                hasAnyValue = true;
            }
        });
        
        // If this row has no values, remove it
        if (!hasAnyValue) {
            removeRow(rowIndex);
        }
    }
    
    // Function to check if we need to add a new column
    function checkAddColumn() {
        if (isAddingColumn) return;
        
        const lastHeader = headerRow.querySelector('th:last-child');
        const varNameInput = lastHeader.querySelector('.var-name');
        
        // If the last column's variable name has content, add a new column
        if (varNameInput.value.trim() !== '') {
            isAddingColumn = true;
            addColumn();
            // Reset flag after a short delay
            setTimeout(() => {
                isAddingColumn = false;
            }, 100);
        }
    }
    
    // Function to check if we need to add a new row
    function checkAddRow() {
        if (isAddingRow) return;
        
        const lastRow = tableBody.querySelector('tr:last-child');
        const inputs = lastRow.querySelectorAll('.cell-input');
        
        // Check if any cell in the last row has content
        let hasContent = false;
        inputs.forEach(input => {
            if (input.value.trim() !== '') {
                hasContent = true;
            }
        });
        
        if (hasContent) {
            isAddingRow = true;
            addRow();
            // Reset flag after a short delay
            setTimeout(() => {
                isAddingRow = false;
            }, 100);
        }
    }
    
    // Function to check if a string is a valid Python identifier
    function isValidPythonIdentifier(name) {
        if (!name || name.trim() === '') {
            return false;
        }
        
        // Python identifier rules:
        // - Must start with a letter or underscore
        // - Can contain letters, digits, and underscores
        // - Cannot be a keyword (we'll check common ones)
        // - Cannot start with a digit
        
        const trimmed = name.trim();
        
        // Empty string is not valid
        if (trimmed === '') {
            return false;
        }
        
        // Cannot start with a digit
        if (/^\d/.test(trimmed)) {
            return false;
        }
        
        // Must match pattern: letter/underscore followed by letters, digits, underscores
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmed)) {
            return false;
        }
        
        // Check for Python keywords
        const keywords = [
            'and', 'as', 'assert', 'break', 'class', 'continue', 'def', 'del',
            'elif', 'else', 'except', 'False', 'finally', 'for', 'from', 'global',
            'if', 'import', 'in', 'is', 'lambda', 'None', 'nonlocal', 'not', 'or',
            'pass', 'raise', 'return', 'True', 'try', 'while', 'with', 'yield'
        ];
        
        if (keywords.includes(trimmed)) {
            return false;
        }
        
        return true;
    }
    
    // Function to get all variable names from headers
    function getAllVariableNames(excludeInput) {
        const headers = headerRow.querySelectorAll('th');
        const names = [];
        headers.forEach((header, index) => {
            const varNameInput = header.querySelector('.var-name');
            if (varNameInput && varNameInput !== excludeInput) {
                const name = varNameInput.value.trim();
                if (name !== '') {
                    names.push({ name: name.toLowerCase(), index: index, input: varNameInput });
                }
            }
        });
        return names;
    }
    
    // Function to validate variable name input
    function validateVariableName(input) {
        const value = input.value.trim();
        
        // Remove error class first
        input.classList.remove('error');
        
        // Empty is valid (no error, but no highlight)
        if (value === '') {
            return;
        }
        
        // Check if it's a valid Python identifier
        if (!isValidPythonIdentifier(value)) {
            input.classList.add('error');
            return;
        }
        
        // Check for duplicates (case-insensitive)
        const allNames = getAllVariableNames(input);
        const lowerValue = value.toLowerCase();
        const isDuplicate = allNames.some(item => item.name === lowerValue);
        
        if (isDuplicate) {
            input.classList.add('error');
        }
    }
    
    // Function to validate all variable names (for when one changes)
    function validateAllVariableNames() {
        const headers = headerRow.querySelectorAll('th');
        headers.forEach(header => {
            const varNameInput = header.querySelector('.var-name');
            if (varNameInput) {
                validateVariableName(varNameInput);
            }
        });
    }
    
    // Function to validate and format cell input based on type
    function validateCellInput(input, type) {
        const value = input.value.trim();
        const isStrikethrough = input.classList.contains('strikethrough');
        
        // Reset styles if empty
        if (value === '') {
            input.style.borderColor = '';
            input.style.backgroundColor = '';
            return;
        }
        
        if (type === 'int') {
            // Check if it's a valid integer
            if (!/^-?\d+$/.test(value)) {
                input.style.borderColor = '#ff6b6b';
                input.style.backgroundColor = '#ffe0e0';
            } else {
                // Use dimmer green if strikethrough
                if (isStrikethrough) {
                    input.style.borderColor = '#a8d5b3';
                    input.style.backgroundColor = '#e8f5eb';
                } else {
                    input.style.borderColor = '#51cf66';
                    input.style.backgroundColor = '#d3f9d8';
                }
            }
        } else if (type === 'str') {
            // Check if it's a valid string (in quotes)
            if (!/^".*"$/.test(value) && !/^'.*'$/.test(value)) {
                input.style.borderColor = '#ff6b6b';
                input.style.backgroundColor = '#ffe0e0';
            } else {
                // Use dimmer green if strikethrough
                if (isStrikethrough) {
                    input.style.borderColor = '#a8d5b3';
                    input.style.backgroundColor = '#e8f5eb';
                } else {
                    input.style.borderColor = '#51cf66';
                    input.style.backgroundColor = '#d3f9d8';
                }
            }
        }
    }
    
    // Attach event listeners to header inputs
    function attachHeaderListeners(headerCell) {
        const varNameInput = headerCell.querySelector('.var-name');
        const varTypeSelect = headerCell.querySelector('.var-type');
        
        varNameInput.addEventListener('input', function() {
            // Validate this variable name
            validateVariableName(varNameInput);
            // Validate all variable names to check for duplicates
            validateAllVariableNames();
            
            checkAddColumn();
            // Check if this column should be removed (use setTimeout to check after value is cleared)
            const currentHeaders = headerRow.querySelectorAll('th');
            const columnIndex = Array.from(currentHeaders).indexOf(headerCell);
            setTimeout(() => {
                checkRemoveColumn(columnIndex);
            }, 0);
        });
        
        varNameInput.addEventListener('blur', function() {
            // Validate this variable name
            validateVariableName(varNameInput);
            // Validate all variable names to check for duplicates
            validateAllVariableNames();
            
            checkAddColumn();
            const headers = headerRow.querySelectorAll('th');
            const columnIndex = Array.from(headers).indexOf(headerCell);
            
            // Never check for removal if this is the last column
            if (columnIndex === headers.length - 1) return;
            
            checkRemoveColumn(columnIndex);
        });
        
        varTypeSelect.addEventListener('change', function() {
            checkAddColumn();
            // Update validation for all cells in this column
            const columnIndex = Array.from(headerRow.querySelectorAll('th')).indexOf(headerCell);
            const rows = tableBody.querySelectorAll('tr');
            rows.forEach(row => {
                const cellInput = row.querySelectorAll('.cell-input')[columnIndex];
                if (cellInput && cellInput.value.trim() !== '') {
                    validateCellInput(cellInput, varTypeSelect.value);
                }
            });
        });
    }
    
    // Arrow key navigation for table cells
    function handleArrowKeyNavigation(e) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            const currentInput = e.target;
            const currentCell = currentInput.closest('td');
            const currentRow = currentInput.closest('tr');
            const rows = tableBody.querySelectorAll('tr');
            const currentRowIndex = Array.from(rows).indexOf(currentRow);
            const columnIndex = Array.from(currentRow.querySelectorAll('td')).indexOf(currentCell);
            
            let targetRowIndex;
            if (e.key === 'ArrowUp') {
                targetRowIndex = currentRowIndex - 1;
            } else { // ArrowDown
                targetRowIndex = currentRowIndex + 1;
            }
            
            // Check if target row exists
            if (targetRowIndex >= 0 && targetRowIndex < rows.length) {
                e.preventDefault();
                const targetRow = rows[targetRowIndex];
                const targetInput = targetRow.querySelectorAll('.cell-input')[columnIndex];
                if (targetInput) {
                    targetInput.focus();
                    targetInput.select();
                }
            }
        }
    }
    
    // Use event delegation for cell inputs (more efficient and handles dynamically added cells)
    tableBody.addEventListener('input', function(e) {
        if (e.target.classList.contains('cell-input')) {
            checkAddRow();
            
            // Get the column index
            const cell = e.target.closest('td');
            const row = e.target.closest('tr');
            const rows = tableBody.querySelectorAll('tr');
            const rowIndex = Array.from(rows).indexOf(row);
            const columnIndex = Array.from(row.querySelectorAll('td')).indexOf(cell);
            
            // Get the type from the header
            const headerCell = headerRow.querySelectorAll('th')[columnIndex];
            if (headerCell) {
                const type = headerCell.querySelector('.var-type').value;
                validateCellInput(e.target, type);
            }
            
            updateStrikethrough();
            
            // Check if row should be removed (use setTimeout to check after value is cleared)
            const currentRows = tableBody.querySelectorAll('tr');
            if (rowIndex < currentRows.length - 1) {
                setTimeout(() => {
                    const rowsAtCallTime = tableBody.querySelectorAll('tr');
                    const currentRowIndex = Array.from(rowsAtCallTime).indexOf(row);
                    // Never remove if it's the last row
                    if (currentRowIndex < rowsAtCallTime.length - 1) {
                        checkRemoveRow(currentRowIndex);
                    }
                }, 0);
            }
        }
    });
    
    tableBody.addEventListener('keydown', function(e) {
        if (e.target.classList.contains('cell-input')) {
            handleArrowKeyNavigation(e);
        }
    });
    
    tableBody.addEventListener('blur', function(e) {
        if (e.target.classList.contains('cell-input')) {
            // Get the column index
            const cell = e.target.closest('td');
            const row = e.target.closest('tr');
            const rows = tableBody.querySelectorAll('tr');
            const rowIndex = Array.from(rows).indexOf(row);
            const columnIndex = Array.from(row.querySelectorAll('td')).indexOf(cell);
            
            // Get the type from the header
            const headerCell = headerRow.querySelectorAll('th')[columnIndex];
            if (headerCell) {
                const type = headerCell.querySelector('.var-type').value;
                validateCellInput(e.target, type);
            }
            
            updateStrikethrough();
            
            // Never check for removal if this is the last row
            const currentRows = tableBody.querySelectorAll('tr');
            if (rowIndex < currentRows.length - 1) {
                checkRemoveRow(rowIndex);
            }
            
            // Check if column should be removed
            const currentHeaders = headerRow.querySelectorAll('th');
            if (columnIndex < currentHeaders.length - 1) {
                checkRemoveColumn(columnIndex);
            }
        }
    }, true); // Use capture phase for blur events
    
    // Function to remove empty input boxes (except the last one)
    function removeEmptyInputs() {
        const allInputs = inputsContainer.querySelectorAll('.user-input');
        // Never remove if there's only one input
        if (allInputs.length <= 1) return;
        
        // Collect inputs to remove (empty ones that are not the last)
        const inputsToRemove = [];
        allInputs.forEach((input, index) => {
            const isLast = index === allInputs.length - 1;
            // Mark for removal if empty and not the last one
            if (!isLast && input.value.trim() === '') {
                inputsToRemove.push(input);
            }
        });
        
        // Remove the collected inputs
        inputsToRemove.forEach(input => input.remove());
    }
    
    // User input boxes functionality
    function addInputBox() {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'user-input';
        input.placeholder = 'Write user input value here...';
        inputsContainer.appendChild(input);
        
        // When this input gets focus and has content, add another
        input.addEventListener('input', function() {
            if (input.value.trim() !== '') {
                // Check if there's already a next input
                const nextInput = input.nextElementSibling;
                if (!nextInput || !nextInput.classList.contains('user-input')) {
                    addInputBox();
                }
            } else {
                // If input becomes empty, check if we should remove it (but not if it's the last one)
                setTimeout(() => {
                    removeEmptyInputs();
                }, 0);
            }
        });
        
        input.addEventListener('blur', function() {
            // Check if this is the last input and has content
            const allInputs = inputsContainer.querySelectorAll('.user-input');
            const isLast = input === allInputs[allInputs.length - 1];
            if (isLast && input.value.trim() !== '') {
                addInputBox();
            }
            // Remove empty inputs (but not the last one)
            removeEmptyInputs();
        });
    }
    
    // Initialize first input box
    const firstInput = inputsContainer.querySelector('.user-input');
    firstInput.addEventListener('input', function() {
        if (firstInput.value.trim() !== '') {
            const nextInput = firstInput.nextElementSibling;
            if (!nextInput || !nextInput.classList.contains('user-input')) {
                addInputBox();
            }
        } else {
            // If input becomes empty, check if we should remove it (but not if it's the last one)
            setTimeout(() => {
                removeEmptyInputs();
            }, 0);
        }
    });
    
    firstInput.addEventListener('blur', function() {
        const allInputs = inputsContainer.querySelectorAll('.user-input');
        const isLast = firstInput === allInputs[allInputs.length - 1];
        if (isLast && firstInput.value.trim() !== '') {
            addInputBox();
        }
        // Remove empty inputs (but not the last one)
        removeEmptyInputs();
    });
    
    // Export to markdown functionality
    exportBtn.addEventListener('click', function() {
        const headers = headerRow.querySelectorAll('th');
        if (headers.length === 0) {
            alert('No data to export');
            return;
        }
        
        // Collect user inputs
        const userInputs = [];
        const inputElements = inputsContainer.querySelectorAll('.user-input');
        inputElements.forEach(input => {
            const value = input.value.trim();
            if (value !== '') {
                userInputs.push(value);
            }
        });
        
        // Get program output
        const programOutput = document.getElementById('programOutput').value.trim();
        
        // Filter columns - only include columns with non-empty variable names
        const validColumns = [];
        headers.forEach((header, index) => {
            const name = header.querySelector('.var-name').value.trim();
            if (name !== '') {
                const type = header.querySelector('.var-type').value;
                validColumns.push({
                    index: index,
                    name: name,
                    type: type,
                    header: `${name} (${type})`
                });
            }
        });
        
        if (validColumns.length === 0) {
            alert('No valid columns to export');
            return;
        }
        
        // Get all rows and filter out completely empty rows
        const rows = tableBody.querySelectorAll('tr');
        const validRows = [];
        rows.forEach(row => {
            const cells = row.querySelectorAll('.cell-input');
            const rowValues = [];
            let hasAnyValue = false;
            
            validColumns.forEach(col => {
                const cell = cells[col.index];
                const value = cell ? cell.value.trim() : '';
                rowValues.push(value);
                if (value !== '') {
                    hasAnyValue = true;
                }
            });
            
            if (hasAnyValue) {
                validRows.push(rowValues);
            }
        });
        
        // Calculate column widths for proper spacing
        const columnWidths = validColumns.map((col, colIndex) => {
            let maxWidth = col.header.length;
            validRows.forEach(row => {
                const value = row[colIndex] || '';
                if (value.length > maxWidth) {
                    maxWidth = value.length;
                }
            });
            return maxWidth;
        });
        
        // Helper function to pad a string to a specific width
        function padString(str, width) {
            return str + ' '.repeat(Math.max(0, width - str.length));
        }
        
        // Build markdown with proper spacing
        let markdown = '';
        
        // Add user inputs section if there are any
        if (userInputs.length > 0) {
            markdown += '**User Inputs:**\n';
            userInputs.forEach((input, index) => {
                markdown += `${index + 1}. ${input}\n`;
            });
            markdown += '\n';
        }
        
        // Add trace table header
        markdown += '**Trace Table:**\n\n';
        
        // Build table header
        const markdownHeaderRow = '| ' + validColumns.map((col, index) => {
            return padString(col.header, columnWidths[index]);
        }).join(' | ') + ' |\n';
        markdown += markdownHeaderRow;
        
        // Build separator row
        const separatorRow = '| ' + validColumns.map((col, index) => {
            return '-'.repeat(columnWidths[index]);
        }).join(' | ') + ' |\n';
        markdown += separatorRow;
        
        // Build data rows
        validRows.forEach(row => {
            const rowText = '| ' + row.map((value, index) => {
                return padString(value, columnWidths[index]);
            }).join(' | ') + ' |\n';
            markdown += rowText;
        });
        
        // Add program output section if there is any
        if (programOutput !== '') {
            markdown += '\n**Program Output:**\n';
            markdown += '```\n';
            markdown += programOutput;
            markdown += '\n```\n';
        }
        
        // Copy to clipboard
        navigator.clipboard.writeText(markdown).then(() => {
            // Show temporary success message
            const originalText = exportBtn.textContent;
            exportBtn.textContent = 'Copied!';
            exportBtn.style.background = 'linear-gradient(135deg, #51cf66 0%, #40c057 100%)';
            setTimeout(() => {
                exportBtn.textContent = originalText;
                exportBtn.style.background = '';
            }, 2000);
        }).catch(err => {
            // Fallback: show in alert
            alert('Markdown:\n\n' + markdown);
        });
    });
    
    // Reset button functionality
    resetBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to reset everything? This will clear all inputs, the table, and output.')) {
            // Clear all user inputs
            const userInputs = inputsContainer.querySelectorAll('.user-input');
            userInputs.forEach((input, index) => {
                if (index > 0) {
                    input.remove();
                } else {
                    input.value = '';
                }
            });
            
            // Clear program output
            document.getElementById('programOutput').value = '';
            
            // Reset table to initial state (1 column, 1 row)
            // Remove all columns except the first
            const headers = headerRow.querySelectorAll('th');
            for (let i = headers.length - 1; i > 0; i--) {
                headers[i].remove();
            }
            
            // Clear the first header
            const firstHeader = headerRow.querySelector('th');
            firstHeader.querySelector('.var-name').value = '';
            firstHeader.querySelector('.var-type').value = 'str';
            
            // Remove all rows except the first
            const rows = tableBody.querySelectorAll('tr');
            for (let i = rows.length - 1; i > 0; i--) {
                rows[i].remove();
            }
            
            // Clear the first row's cells
            const firstRow = tableBody.querySelector('tr');
            const firstRowCells = firstRow.querySelectorAll('.cell-input');
            firstRowCells.forEach(cell => {
                cell.value = '';
                cell.style.borderColor = '';
                cell.style.backgroundColor = '';
                cell.classList.remove('strikethrough');
            });
            
            // Remove extra cells from first row (keep only one)
            const firstRowTds = firstRow.querySelectorAll('td');
            for (let i = firstRowTds.length - 1; i > 0; i--) {
                firstRowTds[i].remove();
            }
            
            updateStrikethrough();
        }
    });
    
    // Initialize event listeners for the initial column
    attachHeaderListeners(headerRow.querySelector('th'));
    
    // Initial strikethrough update
    updateStrikethrough();
    
    // Initial validation of variable names
    validateAllVariableNames();
});
