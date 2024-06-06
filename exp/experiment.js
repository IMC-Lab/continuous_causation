var jsPsych = initJsPsych({
    experiment_width: 600,
    on_finish: async function (data) {
        // Display completion screen
        jsPsych.getDisplayElement().innerHTML =
            '<div><p>Thanks for completing this experiment!</p>' +
            '<p>Saving your data now......' +
            '<span id="done" style="visibility: hidden;">done!</span></p></div><br><br>' +
            '<p>You will be automatically redirected back to Prolific once the data is saved.</p>';

        //  Save data via HTTP POST
        let dataToServer = {
            'id': jsPsych.randomization.randomID(),
            'extension': 'csv',
            'directory': 'data',
            'experimentName': 'pilot',
            'curData': data.csv()
        };
        await $.post("https://dibs-web01.vm.duke.edu/debrigard/continuous_causation/exp/save.php",
            dataToServer,
            function (data) {
                document.getElementById('done').style.visibility = "visible";

                // Re-direct back to Prolific if  is present
                if (jsPsych.data.getURLVariable('PROLIFIC_PID') != null)
                    setTimeout(function () {
                        window.location = "https://app.prolific.com/submissions/complete?cc=CZY3BN55";
                    }, 3000);
            }).promise().catch(function () { });
    }
});



var mu_c = 75;
var mu_a = mu_c;
var sd_c = jsPsych.randomization.sampleWithoutReplacement([50, 1], 1)[0];
//var sd_c = 1
var sd_a = 50;
var c = Math.floor(4/3 * mu_c + 2/3);
var a = c;
var threshold = jsPsych.randomization.sampleWithoutReplacement([c-1, c+a-1], 1)[0];
//var threshold = c+a-1;
var n_learning_per_block = 10;
var n_blocks = 4;

var c_color = 'rgb(255, 159, 64)';
var a_color = 'rgb(153, 102, 255)';
function color(s, c) {
    return '<span style="color: ' + c + '">' + s + '</span>'
}


var learning_params = new Array(n_blocks);
for (let i = 0; i < n_blocks; i++) {
    for (let j = 0; j < n_learning_per_block; j++) {
        let c = sampleNormal(mu_c, sd_c);
        let a = sampleNormal(mu_a, sd_a);
        let e = Number(c + a > threshold);
        learning_params[i * n_learning_per_block + j] = { 
            block: i,
            trial: i * n_learning_per_block + j,
            last_trial_in_block: j == n_learning_per_block-1,
            c: c, a: a, e: e
        }
    }
}

/* A complete list of all vignettes */
var vignettes = [{
    name: 'sewage', units: 'gallon', interval: 'day', valence: 'negative',
    instructions: ['There are two plants, ' + color('Huxley Steel', c_color) + ' and ' + color('Huxley Lumber', a_color) + ', in the small town of Huxley. Every day, both plants send their sewage to a water treatment facility. The water facility only filters sewage from the two plants, and it is only capable of filtering ' +
        unit(threshold, 'gallon') + ' of sewage per day. So, if ' + color('Huxley Steel', c_color) + ' and ' + color('Huxley Lumber', a_color) + ' together produce more than ' + unit(threshold, 'gallon') + ' of sewage on a given day, then the river will get polluted that day.' + 
        '<br><br><strong> ' + color('Huxley Steel', c_color) + ' and ' + color('Huxley Lumber', a_color) + ' each produce ' + unit(mu_c, 'gallon') +
        ' of sewage on average. </strong> So, the town\'s river' + normality(threshold) + 'gets polluted with sewage.',
        'We will show you how much sewage each of the two plants produced on ' + (n_learning_per_block*n_blocks) +
        ' days in total, separated into ' + n_blocks + ' blocks of ' + n_learning_per_block + ' individual days. For each day, you will be asked whether the river was polluted.' +
        '<br><br><strong>At the end of each block, you will be asked to rate how much the amount of sewage produced by each plant varies from day to day.</strong>'],
    learning: {
        stim1: color('Huxley Steel', c_color) + ' produced ',
        stim2: ' of sewage. ',
        stim3: color('Huxley Lumber', a_color) + ' produced ',
        stim4: ' of sewage.',
        question: 'Did the river get polluted today?',
        alert: 'Remember that the river gets polluted whenever ' + color('Huxley Steel', c_color) + ' and ' + color('Huxley Lumber', a_color) + ' produce <b>more than</b> ' + unit(threshold, 'gallon') + ' of sewage in total.',
    },
    man_check: {
        c: 'How much does the amount of sewage produced by ' + color('Huxley Steel', c_color) + ' vary from day to day?',
        a: 'How much does the amount of sewage produced by ' + color('Huxley Lumber', a_color) + ' vary from day to day?',
    },
    judgment: {
        reminder: 'As a reminder, the water facility is capable of filtering ' + unit(threshold, 'gallon') +
            ' of sewage per day. So, if ' + color('Huxley Steel', c_color) + ' and ' + color('Huxley Lumber', a_color) + ' together produce more than ' + unit(threshold, 'gallon') +
            ' of sewage, then the river will get polluted on that day.',
        vignette: 'Today, ' + color('Huxley Steel', c_color) + ' sent ' + unit(c, 'gallon') + ' of sewage to the water treatment plant and ' + color('Huxley Lumber', a_color) + ' sent ' +
            unit(a, 'gallon') + ' of sewage to the water treatment plant. Together, they sent ' + unit(c + a, 'gallon') + ' of sewage to the water treatment plant. So, the river got polluted.',
        statement: color('Huxley Steel', c_color) + ' producing ' + unit(c, 'gallon') + ' of sewage caused the river to get polluted today.'
    },
    vibe_check: {
        c: '<p><strong>How surprised were you that ' + color('Huxley Steel', c_color) + ' produced ' + unit(c, 'gallon') + ' of sewage?</strong></p>',
        a: '<br><p><strong>How surprised were you that ' + color('Huxley Lumber', a_color) + ' produced ' + unit(a, 'gallon') + ' of sewage?</strong></p>',  
    }
}, {
    name: 'sales', units: 'ream', interval: 'day', valence: 'positive',
    instructions: ['There are two employees, ' + color('Susan', c_color) + ' and ' + color('Mike', a_color) + ', in the sales department of a paper company’s local branch. Every day, both employees try to sell as many reams of paper as possible. ' +
        'The local branch must sell over ' + unit(threshold, 'ream') + ' of paper in order to make a profit for their company. So, if ' + color('Susan', c_color) + ' and ' + color('Mike', a_color) + ' together sell more than ' +
        unit(threshold, 'ream') + ' of paper, then their branch will make a profit for that day.' 
        + '<br><br><strong> ' + color('Susan', c_color) + ' and ' + color('Mike', a_color) + ' each sell ' + unit(mu_c, 'ream') + ' of paper on average. </strong> So, the branch' + normality(threshold) + 'makes a profit.',
        'We will show you how many reams of paper each of the two employees sold on ' + (n_learning_per_block*n_blocks) +
        '  days in total, separated into ' + n_blocks + ' blocks of ' + n_learning_per_block + ' individual days. For each day, you will be asked whether the branch made a profit.'
         + '<br><br><strong>At the end of each block, you will be asked to rate how much the amount of paper sold by each employee varies from day to day.</strong>'],
    learning: {
        stim1: color('Susan', c_color) + ' sold ',
        stim2: ' of paper for the branch.',
        stim3: '<p>' + color('Mike', a_color) + ' sold ',
        stim4: ' of paper for the branch.',
        question: 'Did the branch make a profit today?',
        alert: 'Remember that the local branch makes a profit whenever ' + color('Susan', c_color) + ' and ' + color('Mike', a_color) +  ' sell <b>more than</b> ' + unit(threshold, 'ream') + ' of paper in total.',
    },
    man_check: {
        c: 'How much does the amount of paper sold by ' + color('Susan', c_color) + ' vary from day to day?',
        a: 'How much does the amount of paper sold by ' + color('Mike', a_color) + ' vary from day to day?',
    },
    judgment: {
        reminder: 'As a reminder, each day the local branch of the company will make a profit if ' + color('Susan', c_color) + ' and ' + color('Mike', a_color) + ' together sell over ' +
            unit(threshold, 'ream') + ' of paper.',
        vignette: 'Today,  ' + color('Susan', c_color) + ' sold ' + unit(c, 'ream') + ' of paper and ' + color('Mike', a_color) + ' sold ' +
            unit(a, 'ream') + ' of paper. Together, they sold ' + unit(c+a, 'ream') + ' of paper. So, the branch made a profit.',
        statement: color('Susan', c_color) + ' selling ' + unit(c, 'ream') + ' of paper caused the branch to make a profit today.'
    },
    vibe_check: {
        c: '<p><strong>How surprised were you that ' + color('Susan', c_color) + ' sold ' + unit(c, 'ream') + ' of paper?</strong></p>',
        a: '<br><p><strong>How surprised were you that ' + color('Mike', a_color) + ' sold ' + unit(a, 'ream') + ' of paper?</strong></p>',  
    }
}, {
    name: 'savings', units: 'dollar', interval: 'month', valence: 'positive',
    instructions: [color('Luke', c_color) + ' and ' + color('Lisa', a_color) + ' have a special joint savings account together. At the end of each month, they each independently make a single deposit to their account to save as much money as possible. If ' + color('Luke', c_color) + ' and ' + color('Lisa', a_color) + ' save over ' +
        unit(threshold, 'dollar') + ' by the end of the month, their bank deposits a bonus into their account.' +
        '<br><br><strong> ' + color('Luke', c_color) + ' and ' + color('Lisa', a_color) + ' each save ' + unit(mu_c, 'dollar') + ' on average.</strong> So, the bank' + normality(threshold) + 'deposits a bonus into their account.' ,
        'We will show you how much money each person saved for ' +
        (n_learning_per_block*n_blocks) + '  months in total, separated into ' + n_blocks + ' blocks of ' + n_learning_per_block + ' individual months. For each month, you will be asked whether their bank deposited a bonus into their account.'
         + '<br><br><strong>At the end of each block, you will be asked to rate how much the amount of money saved by each person varies from month to month.</strong>'],
    learning: {
        stim1: color('Luke', c_color) + ' saved ',
        stim2: '. ',
        stim3: color('Lisa', a_color) + ' saved ',
        stim4: '.',
        question: 'Did the bank deposit a bonus into their savings account this month?',
        alert: 'Remember that the bank deposits a bonus into their savings account whenever ' + color('Luke', c_color) + ' and ' + color('Lisa', a_color) + ' save <b>more than</b> ' + unit(threshold, 'dollar') + ' in total.',
    },
    man_check: {
        c: 'How much does the amount of money saved by ' + color('Luke', c_color) + ' vary from month to month?',
        a: 'How much does the amount of money saved by ' + color('Lisa', a_color) + ' vary from month to month?',
    },
    judgment: {
        reminder: 'As a reminder, the bank deposits a bonus into their savings account if they save over ' +
            unit(threshold, 'dollar') + ' during that month.',
        vignette: 'During this month, ' + color('Luke', c_color) + ' saved ' + unit(c, 'dollar') + ', and ' + color('Lisa', a_color) + ' saved ' +
            unit(a, 'dollar') + '. So, the bank deposited a bonus into their savings account.',
        statement: color('Luke', c_color) + ' saving ' + unit(c, 'dollar') + ' caused the bank to deposit a bonus into their savings account this month.'
    },
    vibe_check: {
        c: '<p><strong>How surprised were you that ' + color('Luke', c_color) + ' saved ' + unit(c, 'dollar') + '?</strong></p>',
        a: '<br><p><strong>How surprised were you that ' + color('Lisa', a_color) + ' saved ' + unit(a, 'dollar') + '?</strong></p>',  
    }
},{
    name: 'basketball', units: 'point', interval: 'match', valence: 'positive',
    instructions: ['The local high school has a ' + color('varsity', c_color) + ' basketball team and a ' + color('junior varsity', a_color) + ' basketball team. Every match, both teams play a separate game against teams from other nearby schools. ' +
        'To motivate everyone, the coach has promised to take both teams out for ice cream after any match in which they score over ' + unit(threshold, 'point') +
        ' total. So, if the ' + color('varsity', c_color) + ' and ' + color('junior varsity', a_color) + ' teams together score over ' +
        unit(threshold, 'point') + ' points during a match, the coach will take them out for ice cream.' +
        ' Each match, both teams try to score as many points at possible.' +
        '<br><br><strong>The ' + color('varsity', c_color) + ' and ' + color('junior varsity', a_color) + ' teams each score ' + unit(mu_c, 'point') + ' on average.</strong> So, the coach' + normality(threshold) + 'takes the team out for ice cream.',
        'We will show you how many points each of the two basketball teams scored during ' + (n_learning_per_block*n_blocks) +
        '  matches in total, separated into ' + n_blocks + ' blocks of ' + n_learning_per_block + ' individual matches. For each match, you will be asked whether they went out for ice cream after the match.' + 
        '<br><br><strong>At the end of each block, you will be asked to rate how much the amount of points scored by each team varies from match to match.</strong>'],
    learning: {
        stim1: 'The ' + color('varsity', c_color) + ' team scored ',
        stim2: '.',
        stim3: 'The ' + color('junior varsity', a_color) + ' team scored ',
        stim4: '.',
        question: 'Did the team go out for ice cream today?',
        alert: 'Remember that the team goes out for ice cream whenever the ' + color('varsity', c_color) + ' and ' + color('junior varsity', a_color) + ' teams score <b>more than</b> ' + unit(threshold, 'point') + ' in total.',
    },
    man_check: {
        c: 'How much does the number of points scored by the ' + color('varsity', c_color) + ' team vary from match to match?',
        a: 'How much does the number of points scored by the ' + color('junior varsity', a_color) + ' team vary from match to match?',
    },
    judgment: {
        reminder: 'As a reminder, the coach will take the team out for ice cream if the ' + color('varsity', c_color) + ' and ' + color('junior varsity', a_color) + ' teams score over ' + unit(threshold, 'point') + ' in total.',
        vignette: 'During today’s match, the ' + color('varsity', c_color) + ' team scored ' + unit(c, 'point') + ' and the ' + color('junior varsity', a_color) + ' team scored ' + unit(a, 'point') + '. So, the coach took the team out for ice cream.',
        statement: 'The ' + color('varsity', c_color) + ' team scoring ' + unit(c, 'point') + ' caused the team to go out for ice cream today.'
    },
    vibe_check: {
        c: '<p><strong>How surprised were you that the ' + color('varsity', c_color) + ' team scored ' + unit(c, 'point') + '?</strong></p>',
        a: '<br><p><strong>How surprised were you that the ' + color('junior varsity', a_color) + ' team scored ' + unit(a, 'point') + '?</strong></p>',  
    }
}, {
    name: 'food', units: 'canned good', interval: 'day', valence: 'positive',
    instructions: ['Fairfield Middle School, which teaches ' + color('7th grade', c_color) + ' and ' + color('8th grade', a_color) + ' students, is hosting a food drive for their community. To encourage their students to donate to the food drive, the principal told the school that everyone can receive 15 extra minutes of lunch time whenever the school collects over ' +
        unit(threshold, 'canned good') + '. So, if the ' + color('7th grade', c_color) + ' students and the ' + color('8th grade', a_color) + ' students bring in over ' + unit(threshold, 'canned good') +
        ' in total, the school will receive 15 extra minutes of lunch for that day. ' +
        '<br><br><strong> The ' + color('7th grade', c_color) + ' class and the ' + color('8th grade', a_color) + ' class each bring in ' + unit(mu_c, 'canned good') + ' on average.</strong> So, the school' + normality(threshold) + 'receives 15 extra minutes of lunch time.' ,
        'We will show you how many canned goods were brought in by the ' + color('7th grade', c_color) + ' class and the ' + color('8th grade', a_color) + ' class on ' +
        (n_learning_per_block*n_blocks) + '  days in total, separated into ' + n_blocks + ' blocks of ' + n_learning_per_block + ' individual days. For each day, you will be asked whether the school received 15 extra minutes of lunch time.' + 
        '<br><br><strong>At the end of each block, you will be asked to rate how much the amount of canned goods brought in by each class varies from day to day.</strong>'] ,
    learning: {
        stim1: 'The ' + color('7th grade', c_color) + ' class brought in ',
        stim2: ' for the food drive. ',
        stim3: 'The ' + color('8th grade', a_color) + ' class brought in ',
        stim4: ' for the food drive.',
        question: 'Did Fairfield Middle School receive 15 extra minutes of lunch time today?',
        alert: 'Remember that Fairfield Middle School receives 15 extra minutes during lunch whenever they bring <b>more than</b> ' + unit(threshold, ' canned good') + ' in total.',
    },
    man_check: {
        c: 'How much does the number of canned goods brought in by the ' + color('7th grade', c_color) + ' class vary from day to day?',
        a: 'How much does the number of canned goods brought in by the ' + color('8th grade', a_color) + ' class vary from day to day?',
    },
    judgment: {
        reminder: 'As a reminder, the Fairfield Middle School will receive 15 extra minutes of lunch if the ' + color('7th grade', c_color) + ' class and the ' + color('8th grade', a_color) + ' class bring in over ' + unit(threshold, 'canned good') + ' that day.',
        vignette: 'Today, the ' + color('7th grade', c_color) + ' class brought in ' + unit(c, 'canned good') + ' and the ' + color('8th grade', a_color) + ' class brought in ' +
            unit(a, 'canned good') + '. So, Fairfield Middle School received 15 extra minutes of lunch.',
        statement: 'The ' + color('7th grade', c_color) + ' class bringing in ' + unit(c, 'canned good') + ' caused Fairfield Middle School to receive 15 extra minutes of lunch time today.'
    },
    vibe_check: {
        c: '<p><strong>How surprised were you that the ' + color('7th grade', c_color) + ' class brought in ' + unit(c, 'canned good') + '?</strong></p>',
        a: '<br><p><strong>How surprised were you that the ' + color('8th grade', a_color) + ' class brought in ' + unit(a, 'canned good') + '?</strong></p>',  
    }
}, /*{
    name: 'bus', units: 'minute', interval: 'day', valence: 'negative',
    instructions: 'Sam and Jeffrey are siblings who share a bathroom. Every morning, they catch the bus to their school together. After their mom wakes them up at 6am, they take turns getting ready in the bathroom. <br><br>If Sam and Jeffrey together take longer than ' +
        unit(threshold, 'minute') + ' to get ready, then they will miss their bus to school. If they miss their bus, they will have to walk instead, and they will be late to school.' +
        + '<strong>Sam and Jeffrey each take ' + unit(mu_c, 'minute') + ' to get ready on average.</strong> So, Sam and Jeffrey' + normality(threshold) + 'miss their bus to school.' +
        'We will show you how many minutes each sibling took to get ready on ' +
        n_learning + ' separate days. For each day, you will be asked whether they were late to school. <br><br> Please try to pay attention to how much time Sam and Jeffrey take to get ready each day.',
    learning: {
        stim1: 'Sam took ',
        stim2: ' to get ready. ',
        stim3: 'Jeffrey took ',
        stim4: ' to get ready.<p><strong> Were they late to school today?</strong></p>',
        alert: 'Remember that Sam and Jeffrey will be late to school whenever they take over ' + unit(threshold, 'minute') + ' to get ready in total.',
    },
    man_check: {
        c: 'How much does the amount of time that Sam takes to get ready vary from day to day?',
        a: 'How much does the amount of time that Jeffrey takes to get ready vary from day to day?',
    },
    judgment: {
        reminder: 'As a reminder, Sam and Jeffrey will miss their bus and be late to school if they take over ' + unit(threshold, 'minute') + ' to get ready in total.',
        vignette: 'Today, Sam took ' + unit(c, 'minute') + ' to get ready, and Jeffrey took ' + unit(a, 'minute') + ' to get ready. So, they were late to school.',
        statement: 'Sam taking ' + unit(c, 'minute') + ' to get ready caused him and Jeffrey to be late to school.'
    },
    vibe_check: {
        c: '<p><strong>How surprised were you that Sam took ' + unit(c, 'minute') + ' to get ready?</strong></p>',
        a: '<br><p><strong>How surprised were you that Jeffrey took ' + unit(a, 'minute') + ' to get ready?</strong></p>',  
    }
},*/ {
    name: 'electricity', units: 'megawatt', interval: 'day', valence: 'negative',
    instructions: [color('Chester', c_color) + ' and ' + color('Franklin', a_color) + ' are the only two towns supplied by their local power grid. The power grid is able to supply up to ' +
        unit(threshold, 'megawatt') + ' of renewable electricity per day. So, if the two towns together use more than ' + unit(threshold, 'megawatt') +
        ' of electricity on a given day, the power grid will resort to using non-renewable energy for that day. ' +
        '<br><br><strong> ' + color('Chester', c_color) + ' and ' + color('Franklin', a_color) + ' each use ' + unit(mu_c, 'megawatt') + ' of electricity on average. </strong> So, the power grid' + normality(threshold) + 'uses non-renewable energy.',
        ' We will show you how much electricity each of the two towns used on ' + (n_learning_per_block*n_blocks) +
        '  days in total, separated into ' + n_blocks + ' blocks of ' + n_learning_per_block + ' individual days. For each day, you will be asked whether the power grid used non-renewable energy.' + 
        '<br><br><strong>At the end of each block, you will be asked to rate how much the amount of electricity used by each town varies from day to day.</strong>'],
    learning: {
        stim1: color('Chester', c_color) + ' used ',
        stim2: ' of electricity. ',
        stim3: color('Franklin', a_color) + ' used ',
        stim4: ' of electricity.',
        question: 'Did the power grid use non-renewable energy today?',
        alert: 'Remember that the power grid will use non-renewable energy whenever ' + color('Chester', c_color) + ' and ' + color('Franklin', a_color) + ' use <b>more than</b> ' + unit(threshold, 'megawatt') + ' in total.',
    },
    man_check: {
        c: 'How much does the amount of electricity used by ' + color('Chester', c_color) + ' vary from day to day?',
        a: 'How much does the amount of electricity used by ' + color('Franklin', a_color) + ' vary from day to day?',
    },
    judgment: {
        reminder: 'As a reminder, the power grid is able to supply up to ' + unit(threshold, 'megawatt') +
            ' of renewable electricity on any given day. So, if ' + color('Chester', c_color) + ' and ' + color('Franklin', a_color) + ' together use over ' + unit(threshold, 'megawatt') +
            ' of electricity, there will not be enough renewable energy to supply the towns, and the power grid will use non-renewable energy.',
        vignette: 'Today, ' + color('Chester', c_color) + ' used ' + unit(c, 'megawatt') + ' of electricity and ' + color('Franklin', a_color) + ' used ' + unit(a, 'megawatt') + ' of electricity. So, the power grid used non-renewable energy.',
        statement: color('Chester', c_color) + ' using ' + unit(c, 'megawatt') + ' of electricity caused the power grid to use non-renewable energy today.'
    },
    vibe_check: {
        c: '<p><strong>How surprised were you that ' + color('Chester', c_color) + ' used ' + unit(c, 'megawatt') + ' of electricity?</strong></p>',
        a: '<br><p><strong>How surprised were you that ' + color('Franklin', a_color) + ' used ' + unit(a, 'megawatt') + ' of electricity?</strong></p>',  
    }
}, {
    name: 'water', units: 'gallon', interval: 'day', valence: 'negative',
    instructions: [color('Alison', c_color) + ' and ' + color('Tony', a_color) + ' live together in an apartment in town. To help with utilities, their landlord agreed to pay for them to use up to ' + unit(threshold, 'gallon') + '. So, if ' + color('Alison', c_color) + ' and ' + color('Tony', a_color) + ' together use more than ' +
        unit(threshold, 'gallon') + ' of water in a month, their landlord will send them a bill to pay for the remainder. ' +
        '<br><br><strong>' + color('Alison', c_color) + ' and ' + color('Tony', a_color) + ' each use ' + unit(mu_c, 'gallon') + ' of water on average.</strong> So, the landlord' + normality(threshold) + 'sends them a bill.', 
        'We will show you how much water ' + color('Alison', c_color) + ' and ' + color('Tony', a_color) + ' used on ' + (n_learning_per_block*n_blocks) + '  months in total, separated into ' + n_blocks + ' blocks of ' + n_learning_per_block + ' individual months. For each month, you will be asked whether their landlord sent them a bill.' +
        '<br><br><strong>At the end of each block, you will be asked to rate how much the amount of water used by each person varies from month to month.</strong>'] ,
    learning: {
        stim1: color('Alison', c_color) + ' used ',
        stim2: ' of water.',
        stim3: color('Tony', a_color) + ' used ',
        stim4: ' of water.',
        question: 'Did their landlord send them a bill this month?',
        alert: 'Remember that their landlord will send them a bill whenever ' + color('Alison', c_color) + ' and ' + color('Tony', a_color) + ' use <b>more than</b> ' + unit(threshold, 'gallon') + ' of water in total.',
    },
    man_check: {
        c: 'How much does the amount of water used by ' + color('Alison', c_color) + ' vary from month to month?',
        a: 'How much does the amount of water used by ' + color('Tony', a_color) + ' vary from month to month?',
    },
    judgment: {
        reminder: 'As a reminder, their landlord will pay for ' + color('Alison', c_color) + ' and ' + color('Tony', a_color) + ' to use ' + unit(threshold, 'gallon') +
            ' of water. So, if ' + color('Alison', c_color) + ' and ' + color('Tony', a_color) + ' use more than ' + unit(threshold, 'gallon') +
            ' of water in a single month, their landlord will send them a bill.',
        vignette: 'This month, ' + color('Alison', c_color) + ' used ' + unit(c, 'gallon') + ' of water and ' + color('Tony', a_color) + ' used ' +
            unit(a, 'gallon') + ' of water. So, their landlord sent them a bill.',
        statement: color('Alison', c_color) + ' using ' + unit(c, 'gallon') + ' of water caused their landlord to send them a bill this month.'
    },
    vibe_check: {
        c: '<p><strong>How surprised were you that ' + color('Alison', c_color) + ' used ' + unit(c, 'gallon') + ' of water?</strong></p>',
        a: '<br><p><strong>How surprised were you that ' + color('Tony', a_color) + ' used ' + unit(a, 'gallon') + ' of water?</strong></p>',  
    }
}, {
    name: 'funding', units: 'student', interval: 'year', valence: 'positive',
    instructions: [color('Williamsburg North', c_color) + ' and ' + color('Williamsburg South', a_color) + ' are the two high schools in their district. Each school has around the same number of students. ' +
        'Every year, each school tries to send as many of their graduating students as possible to a university. ' +
        'To encourage college admissions, the state uses the number of students sent to a university to determine how much funding their district’s education program will get for the year. ' +
        'If ' + color('Williamsburg North', c_color) + ' and ' + color('Williamsburg South', a_color) + ' together send over ' + unit(threshold, 'student') +
        ' to a university, their district will receive more education funding. ' +
        '<br><br><strong>' + color('Williamsburg North', c_color) + ' and ' + color('Williamsburg South', a_color) + ' each send ' + unit(mu_c, 'student') + ' to a university on average.</strong> So, their district' + normality(threshold) + 'receives more education funding.',
        'We will show you how many students the two schools sent to a university for ' + (n_learning_per_block*n_blocks) +
        '  years in total, separated into ' + n_blocks + ' blocks of ' + n_learning_per_block + ' individual years. For each year, you will be asked whether the district received more funding.' + 
        '<br><br><strong>At the end of each block, you will be asked to rate how much the amount of students sent by each school varies from year to year.</strong>'],
    learning: {
        stim1: color('Williamsburg North', c_color) + ' sent ',
        stim2: ' to a university.',
        stim3: '' + color('Williamsburg South', a_color) + ' sent ',
        stim4: ' to a university.',
        question: 'Did the district receive more funding this year?',
        alert: 'Remember that the district will receive more funding whenever ' + color('Williamsburg North', c_color) + ' and ' + color('Williamsburg South', a_color) + ' send <b>more than</b> ' + unit(threshold, 'student') + ' to a university in total.',
    },
    man_check: {
        c: 'How much does the number of students that ' + color('Williamsburg North', c_color) + ' sends to a university vary from year to year?',
        a: 'How much does the number of students that ' + color('Williamsburg South', a_color) + ' sends to a university vary from year to year?',
    },
    judgment: {
        reminder: 'As a reminder, the district will receive more funding for education if ' + color('Williamsburg North', c_color) + ' and ' + color('Williamsburg South', a_color) + ' together send over ' + unit(threshold, 'student') + ' to a university.',
        vignette: 'This year, ' + color('Williamsburg North', c_color) + ' sent ' + unit(c, 'student') + ' to a university and ' + color('Williamsburg South', a_color) + ' sent ' + unit(a, 'student') + ' to a university. So, the district received more funding.',
        statement: color('Williamsburg North', c_color) + ' sending ' + unit(c, 'student') + ' to a university caused the district to receive more funding this year.'
    },
    vibe_check: {
        c: '<p><strong>How surprised were you that ' + color('Williamsburg North', c_color) + ' sent ' + unit(c, 'student') + ' to a university?</strong></p>',
        a: '<br><p><strong>How surprised were you that ' + color('Williamsburg South', a_color) + ' sent ' + unit(a, 'student') + ' to a university?</strong></p>',  
    }
}, {
    name: 'trucking', units: 'ton', interval: 'day', valence: 'negative',
    instructions: ['Ned is a trucker who delivers construction supplies for two clients, ' + color('Hammerco', c_color) + ' and ' + color('Brick Works', a_color) + '. ' +
        'Every day, he receives an order from both companies to pick up bricks on the other side of Middleview river. ' +
        'To get there, he must cross the Middleview bridge which has a maximum weight capacity of ' + unit(threshold, 'ton') + 
        '. So, if ' + color('Hammerco', c_color) + ' and ' + color('Brick Works', a_color) + ' need more than ' + unit(threshold, 'ton') + 
        ' of bricks, Ned has to take two trips across the river that day. ' + '<br><br><strong>' + color('Hammerco', c_color) + ' and ' + color('Brick Works', a_color) + ' each order ' + unit(mu_c, 'ton') + ' of bricks on average.</strong> So, Ned' + normality(threshold) + 'takes two trips across the river.',
        'We will show you how much brick ' + color('Hammerco', c_color) + ' and ' + color('Brick Works', a_color) + ' ordered on ' + (n_learning_per_block*n_blocks) +
        ' days in total, separated into ' + n_blocks + ' blocks of ' + n_learning_per_block + ' individual days. For each day, you will be asked whether Ned took two trips across the river.' + 
        '<br><br><strong>At the end of each block, you will be asked to rate how much the amount of bricks ordered by each company varies from day to day.</strong>'],
    learning: {
        stim1: color('Hammerco', c_color) + ' ordered ',
        stim2: ' of bricks.',
        stim3: color('Brick Works', a_color) + ' ordered ',
        stim4: ' of bricks.',
        question: 'Did Ned take two trips across the river today?',
        alert: 'Remember that Ned takes two trips across the river whenever ' + color('Hammerco', c_color) + ' and ' + color('Brick Works', a_color) + ' order <b>more than</b> ' + unit(threshold, 'ton') + ' of bricks in total.',
    },
    man_check: {
        c: 'How much does the amount of brick ordered by ' + color('Hammerco', c_color) + ' vary from day to day?',
        a: 'How much does the amount of brick ordered by ' + color('Brick Works', a_color) + ' vary from day to day?',
    },
    judgment: {
        reminder: 'As a reminder, the Middleview bridge can support a maximum of ' + unit(threshold, 'ton') + 
            '. So, if ' + color('Hammerco', c_color) + ' and ' + color('Brick Works', a_color) + ' order more than ' + unit(threshold, 'ton') + ' of bricks in total, Ned has to take two trips across the river that day.',
        vignette: 'Today, ' + color('Hammerco', c_color) + ' ordered ' + unit(c, 'ton') + ' of brick and ' + color('Brick Works', a_color) + ' ordered ' + unit(a, 'ton') + ' of brick. So, Ned took two trips across the river today.',
        statement: color('Hammerco', c_color) + ' ordering ' + unit(c, 'ton') + ' of brick caused Ned to take two trips across the river today.'
    },
    vibe_check: {
        c: 'How surprised were you that ' + color('Hammerco', c_color) + ' ordered ' + unit(c, 'ton') + ' of bricks?',
        a: 'How surprised were you that ' + color('Brick Works', a_color) + ' ordered ' + unit(a, 'ton') + ' of bricks?',
    } 
}, {
    name: 'running', units: 'mile', interval: 'month', valence: 'positive',
    instructions: ['Francine wants to help her friends ' + color('Olivia', c_color) + ' and ' + color('Mimi', a_color) + ' train for a race. To help achieve their goal, they agreed to a deal. ' +
        'At the start of each month, they will measure how many miles ' + color('Olivia', c_color) + ' and ' + color('Mimi', a_color) + ' each ran since the previous month. Their goal is to run ' +
        unit(threshold, 'mile') + ' combined each month. So, if they run a total of more than ' + unit(threshold, 'mile') + 
        ' that month, Francine will bake them a cake. Francine will not bake a cake if they run less than ' + unit(threshold, 'mile') + ' that month. ' +
        '<br><br><strong>' + color('Olivia', c_color) + ' and ' + color('Mimi', a_color) + ' each run ' + unit(mu_c, 'mile') + ' on average.</strong> So, Francine' + normality(threshold) + 'bakes them a cake.',
        'We will show you how many miles ' + color('Olivia', c_color) + ' and ' + color('Mimi', a_color) + ' ran on ' + (n_learning_per_block*n_blocks) +
        ' months in total. For each month, you will be asked whether Francine baked them a cake.' +
        '<br><br><strong>At the end of each block, you will be asked to rate how much the amount of miles ran by each person varies from month to month.</strong>'],
    learning: {
        stim1: color('Olivia', c_color) + ' ran ',
        stim2: '. ',
        stim3: color('Mimi', a_color) + ' ran ',
        stim4: '.',
        question: 'Did Francine bake them a cake this month?',
        alert: 'Remember that Francine bakes ' + color('Olivia', c_color) + ' and ' + color('Mimi', a_color) + ' a cake whenever they run <b>more than</b> ' + unit(threshold, 'mile') + ' in total.',
    },
    man_check: {
        c: 'How much does the number of miles that ' + color('Olivia', c_color) + ' runs vary from month to month?',
        a: 'How much does the number of miles that ' + color('Mimi', a_color) + ' runs vary from month to month?',
    },
    judgment: {
        reminder: 'As a reminder, ' + color('Olivia', c_color) + ' and ' + color('Mimi', a_color) + ' set a goal to run a total of ' + unit(threshold, 'mile') + 
            ' each month. So, if ' + color('Olivia', c_color) + ' and ' + color('Mimi', a_color) + ' together run over ' + unit(threshold, 'mile') + ', then Francine will bake them a cake.',
        vignette: 'This month, ' + color('Olivia', c_color) + ' ran ' + unit(c, 'mile') + ' and ' + color('Mimi', a_color) + ' ran ' + unit(a, 'mile') + '.',
        statement: color('Olivia', c_color) + ' running ' + unit(c, 'mile') + ' caused Francine to bake a cake this month.'
    },
    vibe_check: {
        c: '<p><strong>How surprised were you that ' + color('Olivia', c_color) + ' ran ' + unit(c, 'mile') + '?</strong></p>',
        a: '<br><p><strong>How surprised were you that ' + color('Mimi', a_color) + ' ran ' + unit(a, 'mile') + '?</strong></p>',  
    }
}, {
    name: 'cellular', units: 'gigabyte', interval: 'month', valence: 'negative',
    instructions: ['To save money, ' + color('Ricardo', c_color) + ' and ' + color('Pierre', a_color) + ' are on a family cell phone plan. The plan has a cellular data limit of ' + 
        unit(threshold, 'gigabyte') + ' per month. So, if ' + color('Ricardo', c_color) + ' and ' + color('Pierre', a_color) + ' together use more than ' +
        unit(threshold, 'gigabyte') + ' of data in a given month, then the cell company will charge them a data overage fee. ' +
        '<strong>' + color('Ricardo', c_color) + ' and ' + color('Pierre', a_color) + ' each use ' + unit(mu_c, 'gigabyte') + ' on average.</strong> So, the cell phone company' + normality(threshold) + 'charges them a data overage fee.',
        'We will show you how much data ' + color('Ricardo', c_color) + ' and ' + color('Pierre', a_color) + ' used on ' + (n_learning_per_block*n_blocks) +
        ' months in total. For each month, you will be asked whether the company charged them a fee.' +
        '<br><br><strong>At the end of each block, you will be asked to rate how much the amount of data used by each person varies from month to month.</strong>'],
    learning: {
        stim1: color('Ricardo', c_color) + ' used ',
        stim2: ' of data.',
        stim3: color('Pierre', a_color) + ' used ',
        stim4: ' of data.',
        question: 'Did the cell company charge them a fee this month?</strong></p>',
        alert: 'Remember that the cell company charges a data overage fee whenever ' + color('Ricardo', c_color) + ' and ' + color('Pierre', a_color) + ' use <b>more than</b> ' + unit(threshold, 'gigabyte') + ' of data in total.',
    },
    man_check: {
        c: 'How much does the amount of data that ' + color('Ricardo', c_color) + ' uses vary from month to month?',
        a: 'How much does the amount of data that ' + color('Pierre', a_color) + ' uses vary from month to month?',
    },
    judgment: {
        reminder: 'As a reminder, the cell company will charge ' + color('Ricardo', c_color) + ' and ' + color('Pierre', a_color) + ' a data overage fee whenever they use over ' + unit(threshold, 'gigabyte') + ' of data in a month.',
        vignette: 'This month, ' + color('Ricardo', c_color) + ' used ' + unit(c, 'gigabyte') + ' of data and ' + color('Pierre', a_color) + ' used ' + unit(a, 'gigabyte') + ' of data. So, the cell company charged them a fee this month.',
        statement: color('Ricardo', c_color) + ' using ' + unit(c, 'gigabyte') + ' of data caused the cell company to charge them a fee this month.'
    },
    vibe_check: {
        c: '<p><strong>How surprised were you that ' + color('Ricardo', c_color) + ' used ' + unit(c, 'gigabyte') + ' of data?</strong></p>',
        a: '<br><p><strong>How surprised were you that ' + color('Pierre', a_color) + ' used ' + unit(a, 'gigabyte') + ' of data?</strong></p>',  
    }
}]

/* Randomly assign a condition */
var id = jsPsych.randomization.randomID();
//var vignette = jsPsych.randomization.sampleWithoutReplacement(vignettes, 1)[0];
var vignette = vignettes[1];  // use to pre-select a specific vignette

console.log('ID: ' + id);
console.log('Vignette: ' + vignette.name);
console.log('sd_c: ' + sd_c);
console.log('threshold: ' + threshold);

/* Capture info from Prolific */
jsPsych.data.addProperties({
    id: id, mu_c: mu_c, mu_a: mu_a, sd_c: sd_c, sd_a: sd_a, 
    threshold: threshold, c: c, a: a, n_learning: n_learning_per_block,
    prolific_id: jsPsych.data.getURLVariable('PROLIFIC_PID'),
    study_id: jsPsych.data.getURLVariable('STUDY_ID'),
    session_id: jsPsych.data.getURLVariable('SESSION_ID')
});
jsPsych.data.addProperties(vignette);

// state whether outcome is often or rare
function normality(threshold){
    if (threshold < (mu_a + mu_c))
        return ' often '
    return ' rarely '

}

// convert a number to a string in the correct units
function unit(n, unit = 'gallon') {
    if (n == 1)
        return n + ' ' + unit;
    return n + ' ' + unit + 's';
}

// capitalize the first letter of a string
function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function barPlot(canvasID='plot', c, a) {
    return new Chart(document.getElementById(canvasID),
        {
            labels: ["Susan", "Mike"],
            options: {
                events: [],
                indexAxis: 'y',
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: capitalize(vignette.units + 's'),
                            font: {
                                size: 18
                            }
                        },
                        ticks: { font: { size: 14 } },
                        min: 0,
                        max: Math.round(Math.max(threshold * 1.25, mu_c + 2.5 * sd_c + mu_a + 2.5 * sd_a))
                    }
                },
                animation: { duration: 0 },
                plugins: {
                    legend: {
                        display: false,
                        labels: {font: { size: 18 } }
                    }
                }
            },
            data: {
                labels: [''],
                datasets: [
                    { type: 'bar', label: 'C', data: [ c ], backgroundColor: c_color, maxBarThickness: 50 }, 
                    { type: 'bar', label: 'A', data: [ a ], backgroundColor: a_color, maxBarThickness: 50 }
                ]
            },
            plugins: [{
                afterDatasetsDraw: (chart, options, el) => {
                    const ctx = chart.ctx;
                    const xAxis = chart.scales['x'];
                    const yAxis = chart.scales['y'];
                    ctx.save();
                    ctx.strokeStyle = 'rgba(0, 0, 0, 1)'; // Set the line color
                    ctx.lineWidth = 2; // Set the line width
                    ctx.setLineDash([5, 7.5]);
                    ctx.beginPath();
                    ctx.moveTo(xAxis.getPixelForValue(threshold), yAxis.top);
                    ctx.lineTo(xAxis.getPixelForValue(threshold), yAxis.bottom);
                    ctx.stroke();
                    ctx.restore();
                }
            }]
        }
    );
}

/* Get informed consent */
var consent = {
    type: jsPsychExternalHtml,
    url: "consent.html",
    cont_btn: "start",
    check_fn: function () {
        if (!document.getElementById('consent_checkbox').checked) {
            alert("If you wish to participate, you must check the box next to the statement 'I consent to participate in this study.'");
            return false;
        }
        return true;
    }
};

/* Display post-questionnaire */
var age = {
    timeline: [{
        type: jsPsychSurveyText,
        questions: [{ name: "age", prompt: "What is your age?", required: true }],
        on_finish: function (data) {
            data.measure = "age";
            data.response = parseInt(data.response.age);
        }
    }],
    loop_function: function (data) {
        let response = parseInt(data.values()[0].response);
        if (isNaN(response)) alert("Please enter in your age as a number.");
        if (!isNaN(response) && (response <= 0 || response > 150)) alert("Please enter a valid age.");
        return isNaN(response) || response <= 0 || response > 150;
    }
};

var gender = {
    type: jsPsychSurveyMultiChoice,
    questions: [{
        name: 'gender', type: 'multi-choice', prompt: 'What is your gender?',
        options: jsPsych.randomization.shuffle(['Male', 'Female', 'Other']),
        option_reorder: 'random', required: true
    }],
    on_finish: function (data) {
        data.measure = "gender";
        data.response = data.response.gender;
    }
};

var attn_check = {
    type: jsPsychSurveyMultiChoice,
    questions: [{
        name: 'attn_check', type: 'multi-choice', required: true,
        prompt: `<p align='left'>Please be honest when answering the following question.
           <b>Your answer will not affect your payment or eligibility for future studies.</b></p>
           <p align='left'>The study you have just participated in is a psychological study aimed at understanding human cognition and behavior.
            Psychological research depends on participants like you.
            Your responses to surveys like this one are an incredibly valuable source of data for researchers.
            It is therefore crucial for research that participants pay attention, avoid distractions,
            and take all study tasks seriously (even when they might seem silly).</p>
           <b>Do you feel that you paid attention, avoided distractions, and took this survey seriously?</b>`,
        options: ["No, I was distracted.",
            "No, I had trouble paying attention",
            "No, I did not take the study seriously",
            "No, something else affected my participation negatively.",
            "Yes."]
    }],
    on_finish: function (data) {
        data.measure = "attention_check";
        data.response = data.response.attn_check;
    }
};

var comments = {
    type: jsPsychSurveyText,
    questions: [{ name: 'comments', type: 'text', prompt: "Do you have anything else to add (comments, questions, etc)?", rows: 10 }],
    on_finish: function (data) {
        data.measure = "comments";
        data.response = data.response.comments;
    }
}

var instructions = {
    type: jsPsychInstructions,
    show_clickable_nav: true,
    pages: ['<p>In this study, you will be asked to read some scenarios and to answer questions about these scenarios.</p>',
            ...vignette.instructions]
}

function sampleNormal(mean, sd, min = 0, max = Infinity) {
    let s = Math.round(jStat.normal.sample(mean, sd));
    while (s < min || s > max)
        s = Math.round(jStat.normal.sample(mean, sd));
    return s;
}

Chart.register('chartjs-plugin-annotation');

/* run learning trials */
var current_trial = 0;  // counter for current trial in block
var learning_block = {
    timeline: [{
        timeline: [{
            type: jsPsychHtmlButtonResponse,
            choices: ['No', 'Yes'],
            button_html: '<button class="jspsych-btn" disabled>%choice%</button>',
            stimulus: function () {
                return '<p align="left">' + capitalize(vignette.interval) + ' ' + (current_trial + 1) + ' of ' + n_blocks * n_learning_per_block + ':</p>' + 
                    vignette.learning.stim1 + unit(learning_params[current_trial].c, vignette.units) +
                    vignette.learning.stim2 + '<br>' + vignette.learning.stim3 +
                    unit(learning_params[current_trial].a, vignette.units) + vignette.learning.stim4 +
                    '<br><br><canvas id="plot" height="125px"></canvas><p><strong>' + vignette.learning.question + '</strong></p>';
            },
            on_load: function () {
                setTimeout(function() {
                    document.querySelectorAll('.jspsych-btn').forEach(function(button) {
                        button.disabled = false;
                    });
                }, 1000); // 1000ms delay before showing buttons
                
                let chart = barPlot('plot', learning_params[current_trial].c, learning_params[current_trial].a);
            },
            data: function () {
                return {
                    block: learning_params[current_trial].block+1,
                    trial: current_trial+1,
                    c: learning_params[current_trial].c,
                    a: learning_params[current_trial].a,
                    e: learning_params[current_trial].e,
                }
            }
        }, {
            type: jsPsychInstructions,
            show_clickable_nav: true, allow_backward: false,
            pages: function () {
                let d = jsPsych.data.getLastTrialData().values()[0];
                let header = '<p align="left">' + capitalize(vignette.interval) + ' ' + d.trial + ' of ' + n_blocks*n_learning_per_block + ':</p>';
                if (d.response == d.e)
                    return [header + '<p style="font-weight: bold; color: green;">Correct!</p>'];

                return [header + '<p style="font-weight: bold; color: red;">Incorrect, please try again.</p>' +
                    '<p>' + vignette.learning.alert + '</p>'];
            }
        }],
        loop_function: function (data) {
            return data.values()[0].response != data.values()[0].e;
        }
    }],
    loop_function: function() {
        current_trial += 1;
        return !learning_params[current_trial-1].last_trial_in_block;
    }
}

var block_completion = {
    type: jsPsychInstructions,
    show_clickable_nav: true,
    pages: function () {
        return ['Great work, you finished block ' + (learning_params[current_trial-1].block + 1) +
                ' of ' + n_blocks + '!']
    }
}

/* display manipulation check */
var man_check_c = {
    type: jsPsychHtmlSliderResponse,
    stimulus: '<strong>' + vignette.man_check.c + '</strong>',
    min: 0, max: 1, step: 'any', require_movement: true, labels: ['not at all', 'very much'],
    // Hide the slider thumb until response
    on_load: function () {
        document.getElementById('jspsych-html-slider-response-response').classList.add('hidden');
        document.getElementById('jspsych-html-slider-response-response').addEventListener('click', function (e) {
            e.target.classList.remove('hidden');
        });
    },
    data: function () {
        return {
            measure: 'manipulation_check_c',
            variable: 'c', 
            block: learning_params[current_trial-1].block + 1,
            trial: current_trial
        }
    }
}

var man_check_a = {
    type: jsPsychHtmlSliderResponse,
    stimulus: function () {
        let data = jsPsych.data.getLastTrialData().values()[0];
        return '<div style="opacity: .5;">' + data.stimulus +
            `<div class="jspsych-html-slider-response-container" style="position:relative; margin: 0 auto 3em auto; width:auto;">
            <input type="range" disabled="true" class="jspsych-slider" value="` + data.response + `" min="0" max="1" step="any">
            <div>
                <div style="border: 1px solid transparent; display: inline-block; position: absolute; left:calc(0% - (100% / 2) - -7.5px); text-align: center; width: 100%;">
                    <span style="text-align: center; font-size: 80%;">not at all</span>
                </div>
                <div style="border: 1px solid transparent; display: inline-block; position: absolute; left:calc(100% - (100% / 2) - 7.5px); text-align: center; width: 100%;">
                    <span style="text-align: center; font-size: 80%;">totally random</span>
                </div>
            </div>
            </div></div>` +
            '<strong>' + vignette.man_check.a + '</strong>';
    },
    min: 0, max: 1, step: 'any', require_movement: true, labels: ['not at all', 'very much'],
    // Hide the slider thumb until response
    on_load: function () {
        document.getElementById('jspsych-html-slider-response-response').classList.add('hidden');
        document.getElementById('jspsych-html-slider-response-response').addEventListener('click', function (e) {
            e.target.classList.remove('hidden');
        });
    },
    data: function () {
        return {
            measure: 'manipulation_check_a',
            variable: 'a',
            block: learning_params[current_trial-1].block + 1,
            trial: current_trial
        }
    }
}

var learning_stage = {
    timeline: [learning_block, block_completion, man_check_c, man_check_a],
    repetitions: n_blocks
}

var judgment_instructions = {
    type: jsPsychInstructions,
    show_clickable_nav: true,
    pages: ['<p>You have completed all ' + n_blocks + ' blocks!</p>' +
            '<p>Finally, we will show you one more scenario and ask you some questions about it in particular.</p>' +
            '<br><p><strong>Please read the scenario and respond to these questions carefully.</strong></p>']
}

/*display judgment */
var judgment = {
    type: jsPsychHtmlSliderResponse,
    stimulus: '<p>' + vignette.judgment.reminder + '</p>' + 
        '<p>' + vignette.judgment.vignette +
        '</p><br><canvas id="plot" height="125px"></canvas><br>' +
        '<p><strong>To what degree do you agree with the following statement?</strong></p><p>' +
        vignette.judgment.statement + '</p>'
    ,
    min: 0, max: 1, step: 'any', require_movement: true, labels: ['not at all', 'totally'],
    // Hide the slider thumb until response
    on_load: function () {
        document.getElementById('jspsych-html-slider-response-response').classList.add('hidden');
        document.getElementById('jspsych-html-slider-response-response').addEventListener('click', function (e) {
            e.target.classList.remove('hidden');
        });

        let plot = barPlot('plot', c, a);
    },
    on_finish: function (data) {
        data.measure = "judgment";
    }
}

/* display confidence */
var confidence = {
    type: jsPsychHtmlSliderResponse,
    stimulus: function () {
        let data = jsPsych.data.getLastTrialData().values()[0];
        return "<p><strong>Here is your response to the previous question:</strong></p>" +
            '<div style="opacity: .5;">' +
            data.stimulus +
            `<div class="jspsych-html-slider-response-container" style="position:relative; margin: 0 auto 3em auto; width:auto;">
            <input type="range" disabled="true" class="jspsych-slider" value="` + data.response + `" min="0" max="1" step="any">
            <div>
                <div style="border: 1px solid transparent; display: inline-block; position: absolute; left:calc(0% - (100% / 2) - -7.5px); text-align: center; width: 100%;">
                    <span style="text-align: center; font-size: 80%;">not at all</span>
                </div>
                <div style="border: 1px solid transparent; display: inline-block; position: absolute; left:calc(100% - (100% / 2) - 7.5px); text-align: center; width: 100%;">
                    <span style="text-align: center; font-size: 80%;">totally</span>
                </div>
            </div>
            </div></div>` +
            '<p><strong>How confident you are in this response?</strong></p>'
    },
    min: 0, max: 1, step: 'any', require_movement: true, labels: ['not at all', 'totally'],
    // Hide the slider thumb until response
    on_load: function () {
        document.getElementById('jspsych-html-slider-response-response').classList.add('hidden');
        document.getElementById('jspsych-html-slider-response-response').addEventListener('click', function (e) {
            e.target.classList.remove('hidden');
        });

        let plot = barPlot('plot', c, a);
    },
    on_finish: function (data) {
        data.measure = "confidence";
    }
}
var vibes_c = {
    type: jsPsychHtmlSliderResponse,
    stimulus: vignette.vibe_check.c,
    min: 0, max: 1, step: 'any', require_movement: true, labels: ['not at all', 'totally'],
    // Hide the slider thumb until response
    on_load: function () {
        document.getElementById('jspsych-html-slider-response-response').classList.add('hidden');
        document.getElementById('jspsych-html-slider-response-response').addEventListener('click', function (e) {
            e.target.classList.remove('hidden');
        });
    },
    on_finish: function (data) {
        data.measure = "vibes_c";
    }
}
var vibes_a = {
    type: jsPsychHtmlSliderResponse,
    stimulus: function () {
        let data = jsPsych.data.getLastTrialData().values()[0];
        return  '<div style="opacity: .5;">' + data.stimulus +
            `<div class="jspsych-html-slider-response-container" style="position:relative; margin: 0 auto 3em auto; width:auto;">
            <input type="range" disabled="true" class="jspsych-slider" value="` + data.response + `" min="0" max="1" step="any">
            <div>
                <div style="border: 1px solid transparent; display: inline-block; position: absolute; left:calc(0% - (100% / 2) - -7.5px); text-align: center; width: 100%;">
                    <span style="text-align: center; font-size: 80%;">not at all</span>
                </div>
                <div style="border: 1px solid transparent; display: inline-block; position: absolute; left:calc(100% - (100% / 2) - 7.5px); text-align: center; width: 100%;">
                    <span style="text-align: center; font-size: 80%;">totally</span>
                </div>
            </div>
            </div></div>` +
            vignette.vibe_check.a
    },
    min: 0, max: 1, step: 'any', require_movement: true, labels: ['not at all', 'totally'],
    // Hide the slider thumb until response
    on_load: function () {
        document.getElementById('jspsych-html-slider-response-response').classList.add('hidden');
        document.getElementById('jspsych-html-slider-response-response').addEventListener('click', function (e) {
            e.target.classList.remove('hidden');
        });
    },
    on_finish: function (data) {
        data.measure = "vibes_a";
    }
}
var justification = {
    type: jsPsychSurveyText,
    questions: [{ name: 'justification', type: 'text', prompt: "Why did you respond the way you did?", rows: 10 }],
    on_finish: function (data) {
        data.measure = "justification";
        data.response = data.response.justification;
    }
}

/* start the experiment */
jsPsych.run([consent, instructions, learning_stage, 
             judgment_instructions, judgment, confidence, justification, vibes_c, vibes_a, 
             age, gender, attn_check, comments]);