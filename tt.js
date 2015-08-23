$(document).ready( function () {
    gameDictionary.init();
    console.log("HERE");
    $('#inputForm').submit(onInputFormSubmit);
    initGameState(0, []);
    $(document).keydown(inactiveKeydownHandler);
})

function newGame() {
    clearOldGame();

    var theWord = gameDictionary.randomBingo();
    var subwords = gameDictionary.subwords(theWord);
    var shuffledWord = gameDictionary.shuffle(theWord);

    initGameState(window.gameState.score, subwords);
    for ( var i in shuffledWord )
    {
        var c = shuffledWord[i];
        var el = $("<div class=\"letterContainer\"><span>" + c + "</span></div>");
        el.attr('ttLetter', c);
        window.gameState.unusedLetterPool.push(el);
        $('#unusedLetters').append(el);
    }

    var lengthSorted = _.sortBy(subwords, function(w) { return w.length });
    var wordsPerColumn = Math.ceil(subwords.length / 4);
    var thisColumn = $("<div class='wordColumn'>");
    var wordsInColumn = 0;

    for ( var i in lengthSorted ) {
        var word = lengthSorted[i];
        var html = "<div class=\"wordContainer\">";
        for ( var j in word ) {
            html = html + "<div class=\"letterContainer\"><span>" + word[j] + "</span></div>";
        }
        html += "</div>";
        var div = $(html);
        window.gameState.wordToDOM[word] = div;
        thisColumn.append(div);
        wordsInColumn = (wordsInColumn + 1) % wordsPerColumn;
        console.log(wordsInColumn);
        if ( wordsInColumn == 0 ) {
            $('#wordListContainer').append(thisColumn);
            thisColumn = $("<div class='wordColumn'>");
        }
    }
    $('#wordListContainer').append(thisColumn);

    $(document).unbind('keydown').keydown(activeKeydownHandler);

    updateTimer();
    updateMultiplier();
    updateScore();
    window.gameState.clockInterval = setInterval(onClockTick, 1000);
}

function inactiveKeydownHandler(event) {
    newGame();
}


function activeKeydownHandler(event) {
    switch ( event.which ) {
        case 13: 
            handleEnter();
            break;
        case 8:
            handleBackspace();
            break;
        case 32:
            handleSpace();
            break;
        case 27:
            window.gameState.timeRemaining = 0;
            updateTimer();
        default:
            if ( event.which >= 65 && event.which <= 90 ) {
                handleAlphaKey(String.fromCharCode(event.which).toLocaleLowerCase());
            }
    }
    return false;
}

function handleEnter() {
    console.log("ENTER");
    var word = $('#usedLetters div.letterContainer')
                .map(function(i) { return $(this).attr('ttLetter') })
                .toArray()
                .join('');

    if ( _.indexOf(window.gameState.subwords, word, true) != -1 )
    {
        if ( window.gameState.wordToDOM[word] != null )
        {
            $(window.gameState.wordToDOM[word]).addClass('solved');
            window.gameState.remaining--;
            if ( word.length == 7 ) {
                window.gameState.gotBingo = true;
            }
            if ( window.gameState.remaining == 0 ) { onWin() }
            window.gameState.wordToDOM[word] = null;
            window.gameState.score += 100 * window.gameState.multiplier;
            window.gameState.multiplier += Math.floor(Math.pow(2.3, word.length) / word.length);
            updateScore();
            updateMultiplier();
        }
        else
        {
            console.log("repeat " + word);
        }
    }
    
    console.log(window.gameState.remaining);

    $('#unusedLetters').append(
        $('#usedLetters div.letterContainer')
    );
}

function handleBackspace() {
    console.log("BACKSPACE");
}

function handleSpace() {
    console.log("SPACE");
}

function handleAlphaKey(c) {
    console.log(c);
    var el = $('#unusedLetters div.letterContainer')
              .filter(function(i) { return $(this).attr('ttLetter') == c })
              .first();
    $('#usedLetters').append(el);
}

function onInputFormSubmit(e) {
    console.log(wordBank);
    return false;
}

function onClockTick() {
    if ( window.gameState.timeRemaining == 0 )
    {
        if ( window.gameState.gotBingo ) {
            onWin();
        }
        else {
            onLose();
        }
        return;
    }
    window.gameState.timeRemaining--;
    if ( window.gameState.multiplier > 1 ) {
        window.gameState.multiplier--;
    }
    updateTimer();
    updateMultiplier();
}

function updateTimer() {
    var minutes = Math.floor(window.gameState.timeRemaining / 60);
    var seconds = window.gameState.timeRemaining % 60;

    if ( seconds < 10 ) {
        seconds = '0' + seconds;
    }

    $('#clock').text(minutes + ':' + seconds);
}

function updateMultiplier() {
    $('#multiplier').text(window.gameState.multiplier + 'x');
}

function updateScore() {
    $('#score').text(formatNumber(window.gameState.score));
}

function onWin() {
    revealAll();
    //alert("WIN");
    onRoundOver();
}

function onLose() {
    revealAll();
    //alert("LOSE");
    onRoundOver();
}

function onRoundOver() {
    window.clearInterval(window.gameState.clockInterval);
    window.gameState.clockInterval = null;
    $(document).unbind('keydown').keydown(inactiveKeydownHandler);

}

function revealAll() {
    $('#wordListContainer div:not(div.solved)').addClass('solved revealed');
}

function clearOldGame() {
    $('#usedLetters').empty();
    $('#unusedLetters').empty();
    $('#wordListContainer').empty();
}

function initGameState(initialScore, subwords) {
    window.gameState = {
        subwords: subwords,
        remaining: subwords.length,
        wordToDOM: {},
        unusedLetterPool: [],
        usedLetterPool: [],
        multiplier: 1,
        score: initialScore,
        clockInterval: null,
        timeRemaining: 120,
        gotBingo: false
    }
}

function formatNumber(nStr)
{
    nStr += '';
    var x = nStr.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}
