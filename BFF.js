var BrainFuck = new function () {
    // This is an extension of https://github.com/James-P-D/BrainfuckBrowser
    const INCREMENT_DATA_POINTER = '>'.charCodeAt(0);
    const INCREMENT_INPUT_POINTER = '{'.charCodeAt(0);
    
    const DECREMENT_INPUT_POINTER = '}'.charCodeAt(0);
    const DECREMENT_DATA_POINTER = '<'.charCodeAt(0);
    const INCREMENT_DATA = '+'.charCodeAt(0);
    const DECREMENT_DATA = '-'.charCodeAt(0);
    const WHILE_NOT_ZERO = '['.charCodeAt(0);
    const END_WHILE = ']'.charCodeAt(0);
    const INPUT = ','.charCodeAt(0);
    const OUTPUT = '.'.charCodeAt(0);

    // Keep all tables at 60 columns
    const COLUMNS = 60;
    
    this.program = [];
    this.brackets = {};
    this.length = 0;

    // Load the default programs on selection-change
    this.DefaultProgramSelect = function (defaultProgramSelect) {
        if (defaultProgramSelect == 'Self Replicator 1') {
            document.getElementById('Program').value =
                '[[{.>]-]]-]>.{[[00000';
        }
        else if (defaultProgramSelect == 'Hello World 2') {
            // This one is better understandable than the other hello world example
            document.getElementById('Program').value = `++++++++++[>+++++++>++++++++++>+++>+<<<<-
            ]
            >++{.
            >+{.
            +++++++{.
            {.
            +++{.
            >++{.<<+++++++++++++++{. >{.
            +++{.
            ------{.
            --------{.
            >+{.
            >{.
            +++{.`;
        }
        else if (defaultProgramSelect == 'HelloWorld') {
            // From https://codegolf.stackexchange.com/questions/55422/hello-world
            document.getElementById('Program').value = '--->->->>+>+>>+[++++[>+++[>++++>-->+++<<<-]<-]<+++]>>>{.>-->-{.>{.{.+>++++>+++{.+>-->[>-{.<<]';
        }
        else {
            document.getElementById('Program').value = '';
        }
    }

    // Generate a table
    this.GenerateTable = function (array, pPointer, iPointer, dPointer) {
        var html = "<TABLE>";
        var rows = Math.ceil(array.length / COLUMNS);

        var i = 0;
        for (var row = 0; row < rows; row++) {
            var rowHeader = "<TR>";
            var rowData = "<TR>";
            var secondRow = "<TR>";
            var thirdRow = "<TR>";
            
            for (var j = 0; j < COLUMNS; j++) {
                if (i >= array.length) {
                    break;
                }

                if (i == pPointer) {
                    // Include an asterix for the current position
                    rowHeader += '<TH class="programPointer">&#9679</TH>';
                }
                else {
                    rowHeader += "<TH >&#9675</TH>";
                }
                
                if (i == iPointer) {
                    // Include an asterix for the current position
                    secondRow += '<TH class="inputPointer">&#9679</TH>';
                }else {
                    secondRow += "<TH>&#9675</TH>";
                }
                
                if (i == dPointer) {
                    // Include an asterix for the current position
                    thirdRow += '<TH class="dataPointer">&#9679</TH>';
                }else {
                    thirdRow += "<TH>&#9675</TH>";
                }
                rowData += "<TD>&#" + array[i] + "</TD>";
                i++;
            }

            rowHeader += "</TR>";
            rowData += "</TR>";

            html += rowHeader + secondRow + thirdRow + rowData;
        }

        html += "</TABLE>";

        return html;
    }

    this.Load = function (sourceCode) {
        this.program = [];
        
        this.dataPointer = document.getElementById('memoryPointer').value;
        this.inputPointer = document.getElementById('inputPointer').value;
        this.programPointer = document.getElementById('programPointer').value;
        
        // Allocate the memory array and draw the table
        this.AllocateMemory = function (memorySize) {
            this.program = new Array(memorySize)
            if (sourceCode.length > memorySize) {
                alert("The Memory is too small for the program");
                memorySize = sourceCode.length;
            }
            for (var i = 0; i < sourceCode.length; i++) {
                // This should give an error message
                this.program[i] = sourceCode[i].charCodeAt(0);
            }
            for (var i = sourceCode.length; i < memorySize; i++) {
                this.program[i] = 0;
            }
            var memoryTable = document.getElementById('ProgramTable');
            var html = BrainFuck.GenerateTable(this.program, this.programPointer, this.inputPointer, this.dataPointer);

            memoryTable.innerHTML = html;
        }



        var programTable = document.getElementById('ProgramTable');
        var html = BrainFuck.GenerateTable(this.program, this.programPointer, this.inputPointer, this.dataPointer);

        programTable.innerHTML = html;

        this.AllocateMemory(document.getElementById('MemorySize').value);

        // enable Buttons
        var stepButton = document.getElementById('StepButton');
        stepButton.disabled = false;
        var runButton = document.getElementById('RunButton');
        runButton.disabled = false;
        var runAllButton = document.getElementById('RunAllButton');
        runAllButton.disabled = false;

        return true;
    }

    this.Step = function (update) {
        // head0 is the data/memory pointer
        // head1 is the input pointer
        switch (this.program[this.programPointer]) {
                
            case INCREMENT_INPUT_POINTER: // {
                this.inputPointer++;
                if (this.inputPointer > 255) {
                    this.inputPointer -= 256;
                }
                this.programPointer++;
                break;
                
            case DECREMENT_INPUT_POINTER: // }

                this.inputPointer = (this.inputPointer - 1) % (256);
                if(this.inputPointer < 0) {
                    this.inputPointer+=256;
                }
                this.programPointer++;
                break;
                
            case INCREMENT_DATA_POINTER: // >
                {
                    // Increment the memory pointer. Remember to wrap.
                    this.dataPointer++;
                    
                    if(this.dataPointer > 255) {
                        this.dataPointer-=256;
                    }
                    this.programPointer++;
                    break;
                }
                
            case DECREMENT_DATA_POINTER: // <
                {
                    // Decrement the memory pointer. Remember to wrap.
                    this.dataPointer = (this.dataPointer - 1) ;
                    if(this.dataPointer < 0) {
                        this.dataPointer+=256;
                    }
                    this.programPointer++;

                    break;
                }
            case INCREMENT_DATA: // +
                {
                    this.program[this.dataPointer]++;
                    if (this.program[this.dataPointer] > 255) {
                        this.program[this.dataPointer] -= 256;
                    }
                    this.programPointer++;

                    break;
                }
            case DECREMENT_DATA: // -
                {
                    // Decrement the current cell. Remember to wrap.
                    this.program[this.dataPointer]--;
                    if(this.program[this.dataPointer] < 0) {
                        this.program[this.dataPointer]+=256;
                    }
                    this.programPointer++;

                    break;
                }
            case OUTPUT: //  .
                {
                    this.program[this.inputPointer] = this.program[this.dataPointer];
                    this.programPointer++;

                    break;
                }
            case INPUT: // = ,
                {

                    // Put the value read into memory
                    this.program[this.dataPointer] = this.program[this.inputPointer];
                    this.programPointer++;

                    break;
                }
            case WHILE_NOT_ZERO: // [
                {
                    if (this.program[this.dataPointer] == 0) {
                        // If the current cell is zero, then jump to the end of the loop
                        var foundOpeningLoops = 0;
                        var count = 1;
                        
                        while((foundOpeningLoops < 1) && (count < this.program.length)) {
                            
                            this.programPointer++;
                            if (this.programPointer > 255) {
                                this.programPointer -= 256;
                            }
                            
                            if(this.program[this.programPointer] == WHILE_NOT_ZERO){
                                foundOpeningLoops--;
                            }else if(this.program[this.programPointer] == END_WHILE){
                                foundOpeningLoops++;
                            }
                            count++;
                        }
                        
                    }
                        
                        // Always incrememnt the programPointer. (If we are going through our while-loop, we
                        // will want to execute the next command. If we have jumped to the end of our while loop
                        // we will want to jump past the ']' and move to the next command)
                    this.programPointer++;
                    

                    break;
                }
            case END_WHILE: // ]
                {
                    // Jump to the top of the loop
                    if (this.program[this.dataPointer] != 0) {
                        var foundClosingLoops = 0;
                        var count = 1;
                        
                        while((foundClosingLoops < 1) && (count < this.program.length)) {
                            
                            this.programPointer--;
                            
                            if(this.programPointer < 0) {
                                this.programPointer+=256;
                            }
                            
                            if(this.program[this.programPointer] == WHILE_NOT_ZERO){
                                foundClosingLoops++;
                            }else if(this.program[this.programPointer] == END_WHILE){
                                foundClosingLoops--;
                            }
                            
                            count++;
                        }
                    }
                        this.programPointer++;
                    
                    
                    break;
                }
            default:
                this.programPointer++;
        }
        if (update){
            var programTable = document.getElementById('ProgramTable');
            var html = BrainFuck.GenerateTable(this.program, this.programPointer, this.inputPointer, this.dataPointer);
            programTable.innerHTML = html;
        }

        

        // If the program is complete, always update the tables
        if (this.programPointer >= this.program.length) {
            var programTable = document.getElementById('ProgramTable');
            this.programPointer = 0;
            var html = BrainFuck.GenerateTable(this.program, this.programPointer, this.inputPointer, this.dataPointer);
            programTable.innerHTML = html;
            BrainFuck.running = false;
            document.getElementById("RunButton").innerText = "Run";
            if(update){
                alert('Complete!');
            }
            return false;
        }

        return true;
    }
    
    // The start button should also be able to stop the program
    this.running = false;
    this.Run = function () {
        if (!BrainFuck.running){
            BrainFuck.running = true;
            document.getElementById("RunButton").innerText = "Stop";
            BrainFuck.RunStep();
        }else{
            BrainFuck.running = false;
            document.getElementById("RunButton").innerText = "Run";
        }
    }

    this.RunStep = function () {
        if (!BrainFuck.Step(true) || !BrainFuck.running){
            return;
        }
        window.setTimeout(BrainFuck.RunStep, 2);
    }
    
    this.RunAll = function () {
        n = 0;
        while (n<5000){
            BrainFuck.Step(false);
            if(n%13 == 0){
                var programTable = document.getElementById('ProgramTable');
                var html = BrainFuck.GenerateTable(this.program, this.programPointer, this.inputPointer, this.dataPointer);
                programTable.innerHTML = html;
            }
            n++;
        }
    }
}
