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
            'experimentName': 'lab_meeting',
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

var mu_c = 10;
var mu_a = 10;
//var sd_c = jsPsych.randomization.sampleWithoutReplacement([5, .1], 1)[0];
var sd_c= .1
var sd_a = 5;
var c = 15;
var a = c;
//var threshold = jsPsych.randomization.sampleWithoutReplacement([c-1, c+a-1], 1)[0];
var threshold = 29
var n_learning = 4;
var n_blocks = 4;

var learning_params = new Array(n_blocks);
for (let i = 0; i < n_blocks; i++) {
    for (let j = 0; j < n_learning; j++) {
        let c = sampleNormal(mu_c, sd_c);
        let a = sampleNormal(mu_a, sd_a);
        let e = Number(c + a > threshold);
        learning_params[i * n_learning + j] = { 
            block: i,
            trial: i * n_learning + j,
            last_trial_in_block: j == n_learning-1,
            c: c, a: a, e: e
        }
    }
}

/* A complete list of all vignettes */
var vignettes = [{
    name: 'sewage', units: 'gallon', interval: 'day', valence: 'negative',
    instructions: ["There are two plants, Huxley Steel and Huxley Lumber, in the small town of Huxley. Every day, both plants send their sewage to a water treatment facility. The water facility only filters sewage from the two plants, and it is only capable of filtering " +
        unit(threshold, 'gallon') + ' of sewage per day. So, if Huxley Steel and Huxley Lumber together produce more than ' + unit(threshold, 'gallon') + ' of sewage on a given day, then the river will get polluted that day.' + 
        '<br><br><strong> Huxley Steel and Huxley Lumber each produce ' + unit(mu_c, 'gallon') +
        ' of sewage on average. </strong> So, the town\'s river' + normality(threshold) + 'gets polluted with sewage.',
        '<br><br>We will show you how much sewage each of the two plants produced on ' + (n_learning*n_blocks) +
        ' total days, separated into ' + n_blocks + ' blocks of ' + n_learning + ' individual days. For each day, you will be asked whether the river was polluted. <br><br>Every ' + n_learning + ' days, you will be asked how much the amount of sewage produced by each plant varies from day to day.'],
    learning: {
        stim1: 'Huxley Steel produced ',
        stim2: ' of sewage. ',
        stim3: '<p>Huxley Lumber produced ',
        stim4: ' of sewage.<p><strong>Did the river get polluted today?</strong></p>',
        alert: 'Remember that the river gets polluted whenever Huxley Steel and Huxley Lumber produce more than ' + unit(threshold, 'gallon') + ' of sewage in total.',
    },
    man_check: {
        c: "How much does the amount of sewage produced by Huxley Steel vary from day to day?",
        a: "How much does the amount of sewage produced by Huxley Lumber vary from day to day?",
    },
    judgment: {
        reminder: 'As a reminder, the water facility is capable of filtering ' + unit(threshold, 'gallon') +
            ' of sewage per day. So, if Huxley Steel and Huxley Lumber together produce more than ' + unit(threshold, 'gallon') +
            ' of sewage, then the river will get polluted on that day.',
        vignette: 'Today, Huxley Steel sent ' + unit(c, 'gallon') + ' of sewage to the water treatment plant and Huxley Lumber sent ' +
            unit(a, 'gallon') + ' of sewage to the water treatment plant. So, the river got polluted.',
        statement: 'Huxley Steel producing ' + unit(c, 'gallon') + ' of sewage caused the river to get polluted today.'
    },
    vibe_check: {
        c: '<p><strong>To what extent did you expect Huxley Steel to produce ' + unit(c, 'gallon') + ' of sewage?</strong></p>',
        a: '<br><p><strong>To what extent did you expect Huxley Lumber to produce ' + unit(a, 'gallon') + ' of sewage?</strong></p>',  
    }
}, {
    name: 'sales', units: 'ream', interval: 'day', valence: 'positive',
    instructions: "There are two employees, Susan and Mike, in the sales department of a paper company’s local branch. Every day, both employees try to sell as many reams of paper as possible. " +
        'The local branch must sell over ' + unit(threshold, 'ream') + ' of paper in order to make a profit for their company. <br><br>So, if Susan and Mike together sell more than ' +
        unit(threshold, 'ream') + ' of paper, then their branch will make a profit for that day.' + '<br><br><strong>Susan and Mike each sell ' + unit(mu_c, 'ream') + ' of paper on average. </strong> So, the branch' + normality(threshold) + 'makes a proft.' +
        '<br><br>We will show you how many reams of paper each of the two employees sold on ' + n_learning +
        ' separate days. For each day, you will be asked whether the branch made a profit. <br><br> Please try to pay attention to how much paper Susan and Mike sold each day.',
    learning: {
        stim1: 'Susan sold ',
        stim2: ' of paper for the branch.',
        stim3: '<p>Mike sold ',
        stim4: ' of paper for the branch. <p><strong>Did the branch make a profit today?</strong></p>',
        alert: 'Remember that the local branch makes a profit whenever Susan and Mike sell over ' + unit(threshold, 'ream') + ' of paper in total.',
    },
    man_check: {
        c: 'How much does the amount of paper sold by Susan vary from day to day?',
        a: 'How much does the amount of paper sold by Mike vary from day to day?',
    },
    judgment: {
        reminder: 'As a reminder, each day the local branch of the company will make a profit if Susan and Mike together sell over ' +
            unit(threshold, 'ream') + ' of paper.',
        vignette: 'Today, Susan sold ' + unit(c, 'ream') + ' of paper and Mike sold ' +
            unit(a, 'ream') + ' of paper. So, the branch made a profit.',
        statement: 'Susan selling ' + unit(c, 'ream') + ' of paper caused the branch to make a profit today.'
    },
    vibe_check: {
        c: '<p><strong>To what extent did you expect Susan to sell ' + unit(c, 'ream') + ' of paper?</strong></p>',
        a: '<br><p><strong>To what extent did you expect Mike to sell ' + unit(a, 'ream') + ' of paper?</strong></p>',  
    }
}, {
    name: 'savings', units: 'dollar', interval: 'month', valence: 'positive',
    instructions: 'Luke and Lisa have a special joint savings account together. Every month, they each add money to their account. If Luke and Lisa save over ' +
        unit(threshold, 'dollar') + ' by the end of the month, their bank deposits a bonus into their account.' +
        '<br><br><strong>Luke and Lisa each save ' + unit(mu_c, 'dollar') + ' on average.</strong> So, their account' + normality(threshold) + 'receives a bonus.' + '<br><br>We will show you how much money each person saved for ' +
        n_learning + ' separate months. For each month, you will be asked whether their bank deposited a bonus into their account. <br><br> Please try to pay attention to how much money Luke and Lisa save each month.',
    learning: {
        stim1: 'Luke saved ',
        stim2: '. ',
        stim3: 'Lisa saved ',
        stim4: '.<p><strong>Did the bank deposit a bonus into their savings account this month?</strong></p>',
        alert: 'Remember that the bank deposits a bonus into their savings account whenever Luke and Lisa save over ' + unit(threshold, 'dollar') + ' in total.',
    },
    man_check: {
        c: 'How much does the amount of money saved by Luke vary from month to month?',
        a: 'How much does the amount of money saved by Lisa vary from month to month?',
    },
    judgment: {
        reminder: 'As a reminder, the bank deposits a bonus into their savings account if they save over ' +
            unit(threshold, 'dollar') + ' during that month.',
        vignette: 'During this month, Luke saved ' + unit(c, 'dollar') + ', and Lisa saved ' +
            unit(a, 'dollar') + '. So, the bank deposited a bonus into their savings account.',
        statement: 'Luke saving ' + unit(c, 'dollar') + ' caused the bank to deposit a bonus into their savings account this month.'
    },
    vibe_check: {
        c: '<p><strong>To what extent did you expect Luke to save ' + unit(c, 'dollar') + '?</strong></p>',
        a: '<br><p><strong>To what extent did you expect Lisa to save ' + unit(a, 'gallon') + '?</strong></p>',  
    }
},{
    name: 'basketball', units: 'point', interval: 'match', valence: 'positive',
    instructions: 'The local high school has a varsity basketball team and a junior varsity basketball team. Every match, both teams play a separate game against teams from other nearby schools. ' +
        'To motivate everyone, the coach has promised to take both teams out for ice cream after any match in which they score over ' + unit(threshold, 'point') +
        ' total. <br><br> So, if the varsity and junior varsity teams together score over ' +
        unit(threshold, 'point') + ' points during a match, the coach will take them out for ice cream.' +
        '<br><br><strong>The varsity and junior varsity teams each score ' + unit(mu_c, 'point') + ' on average.</strong> So, the teams' + normality(threshold) + 'go out for ice cream.' +
        '<br><br>We will show you how many points each of the two basketball teams scored during ' + n_learning +
        ' separate matches. For each match, you will be asked whether they went out for ice cream after the match. <br><br> Please try to pay attention to how many points the varsity and junior varsity team score each match.',
    learning: {
        stim1: 'The varsity team scored ',
        stim2: '.',
        stim3: 'The junior varsity team scored ',
        stim4: '. <p><strong>Did the team go out for ice cream today?</strong></p>',
        alert: 'Remember that the team goes out for ice cream whenever the varsity and junior varsity teams score over ' + unit(threshold, 'point') + ' in total.',
    },
    man_check: {
        c: 'How much does the number of points scored by the varsity team vary from match to match?',
        a: 'How much does the number of points scored by the junior varsity team vary from match to match?',
    },
    judgment: {
        reminder: 'As a reminder, the coach will take the team out for ice cream if the varsity and junior varsity teams score over ' + unit(threshold, 'point') + ' in total.',
        vignette: 'During today’s match, the varsity team scored ' + unit(c, 'point') + ' and the junior varsity team scored ' + unit(a, 'point') + '. So, the coach took the team out for ice cream.',
        statement: 'The varsity team scoring ' + unit(c, 'point') + ' caused the team to go out for ice cream today.'
    },
    vibe_check: {
        c: '<p><strong>To what extent did you expect the varsity team to score ' + unit(c, 'point') + '?</strong></p>',
        a: '<br><p><strong>To what extent did you expect the junior varsity team to score ' + unit(a, 'point') + '?</strong></p>',  
    }
}, {
    name: 'food', units: 'canned good', interval: 'day', valence: 'positive',
    instructions: 'Fairfield Middle School, which teaches 7th grade and 8th grade students, is hosting a food drive for their community. To encourage their students to donate to the food drive, the principal told the school that everyone can receive 15 extra minutes of lunch time whenever the school collects over ' +
        unit(threshold, 'canned good') + '. <br><br> So, if the 7th grade students and the 8th grade students bring in over ' + unit(threshold, 'canned good') +
        ' in total, the school will receive 15 extra minutes of lunch for that day.' +
        '<strong> The 7th grade class and the 8th grade class each bring in ' + unit(mu_c, 'canned good') + ' on average.</strong><br> So, the school' + normality(threshold) + 'receives 15 extra minutes of lunch time.' +
        ' <br>We will show you how many canned goods were brought in by the 7th grade class and the 8th grade class on ' +
        n_learning + ' separate days. For each day, you will be asked whether the school received 15 extra minutes of lunch time. <br><br> Please try to pay attention to how many canned goods the 7th and 8th grade bring in each day.' ,
    learning: {
        stim1: 'The 7th grade class brought in ',
        stim2: ' for the food drive. ',
        stim3: 'The 8th grade class brought in ',
        stim4: ' for the food drive.<p><strong>Did Fairfield Middle School receive 15 extra minutes of lunch time today?</strong></p>',
        alert: 'Remember that Fairfield Middle School receives 15 extra minutes during lunch whenever they bring over ' + unit(threshold, ' canned good') + ' in total.',
    },
    man_check: {
        c: 'How much does the number of canned goods brought in by the 7th grade class vary from day to day?',
        a: 'How much does the number of canned goods brought in by the 8th grade class vary from day to day?',
    },
    judgment: {
        reminder: 'As a reminder, the Fairfield Middle School will receive 15 extra minutes of lunch if the 7th grade class and the 8th grade class bring in over ' + unit(threshold, 'canned good') + ' that day.',
        vignette: 'Today, the 7th grade class brought in ' + unit(c, 'canned good') + ' and the 8th grade class brought in ' +
            unit(a, 'canned good') + '. So, Fairfield Middle School received 15 extra minutes of lunch.',
        statement: 'The 7th grade class bringing in ' + unit(c, 'canned good') + ' caused Fairfield Middle School to receive 15 extra minutes of lunch time today.'
    },
    vibe_check: {
        c: '<p><strong>To what extent did you expect the 7th grade class to bring in ' + unit(c, 'canned good') + '?</strong></p>',
        a: '<br><p><strong>To what extent did you expect the 8th grade class to bring in ' + unit(a, 'canned good') + '?</strong></p>',  
    }
}, {
    name: 'bus', units: 'minute', interval: 'day', valence: 'negative',
    instructions: 'Sam and Jeffrey are siblings who share a bathroom. Every morning, they catch the bus to their school together. After their mom wakes them up at 6am, they take turns getting ready in the bathroom. <br><br>If Sam and Jeffrey together take longer than ' +
        unit(threshold, 'minute') + ' to get ready, then they will miss their bus to school. If they miss their bus, they will have to walk instead, and they will be late to school.' +
        + '<strong>Sam and Jeffrey each take ' + unit(mu_c, 'minute') + ' to get ready on average.</strong> So, Sam and Jeffrey' + normality(threshold) + 'miss their bus to school.' +
        '<br><br>We will show you how many minutes each sibling took to get ready on ' +
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
        c: '<p><strong>To what extent did you expect Sam to take ' + unit(c, 'minute') + ' to get ready?</strong></p>',
        a: '<br><p><strong>To what extent did you expect Jeffrey to take ' + unit(a, 'minute') + ' to get ready?</strong></p>',  
    }
}, {
    name: 'electricity', units: 'megawatt', interval: 'day', valence: 'negative',
    instructions: 'Chester and Franklin are the only two towns supplied by their local power grid. The power grid is able to supply up to ' +
        unit(threshold, 'megawatt') + ' of renewable electricity per day. <br><br>So, if the two towns together use more than ' + unit(threshold, 'megawatt') +
        ' of electricity on a given day, the power grid will resort to using non-renewable energy for that day.' +
        '<strong>Chester and Franklin each use ' + unit(mu_c, 'megawatt') + ' of electricity on average. </strong> So, the power grid' + normality(threshold) + 'uses non-renewable energy.' +
        ' <br><br>We will show you how much electricity each of the two towns used on ' + n_learning +
        ' separate days. For each day, you will be asked whether the power grid used non-renewable energy. <br><br> Please try to pay attention to how much electricity Chester and Franklin use each day.',
    learning: {
        stim1: 'Chester used ',
        stim2: ' of electricity. ',
        stim3: 'Franklin used ',
        stim4: ' of electricity. <p><strong>Did the power grid use non-renewable energy today?</strong></p>',
        alert: 'Remember that the power grid will use non-renewable energy whenever Chester and Franklin use over ' + unit(threshold, 'megawatt') + ' in total.',
    },
    man_check: {
        c: 'How much does the amount of electricity used by Chester vary from day to day?',
        a: 'How much does the amount of electricity used by Franklin vary from day to day?',
    },
    judgment: {
        reminder: 'As a reminder, the power grid is able to supply up to ' + unit(threshold, 'megawatt') +
            ' of renewable electricity on any given day. So, if Chester and Franklin together use over ' + unit(threshold, 'megawatt') +
            ' of electricity, there will not be enough renewable energy to supply the towns, and the power grid will use non-renewable energy.',
        vignette: 'Today, Chester used ' + unit(c, 'megawatt') + ' of electricity and Franklin used ' + unit(a, 'megawatt') + ' of electricity. So, the power grid used non-renewable energy.',
        statement: 'Chester using ' + unit(c, 'megawatt') + ' of electricity caused the power grid to use non-renewable energy today.'
    },
    vibe_check: {
        c: '<p><strong>To what extent did you expect Chester to use ' + unit(c, 'megawatt') + ' of electricity?</strong></p>',
        a: '<br><p><strong>To what extent did you expect Franklin to use ' + unit(a, 'megawatt') + ' of electricity?</strong></p>',  
    }
}, {
    name: 'water', units: 'gallon', interval: 'day', valence: 'negative',
    instructions: 'Alison and Tony live together in an apartment in town. To help with utilities, their landlord agreed to pay for them to use up to ' + unit(threshold, 'gallon') + '. <br><br>So, if Alison and Tony together use more than ' +
        unit(threshold, 'gallon') + ' of water in a month, their landlord will send them a bill to pay for the remainder.' +
        '<strong>Alison and Tony each use ' + unit(mu_c, 'gallon') + ' of water on average.</strong> So, Alison and Tony' + normality(threshold) + 'receive a bill.' + 
        '<br><br>We will show you how much water Tony and Alison used on ' + n_learning + ' separate months. For each month, you will be asked whether their landlord sent them a bill. <br><br> Please try to pay attention to how much water Tony and Alison use each month.' ,
    learning: {
        stim1: 'Alison used ',
        stim2: ' of water.',
        stim3: 'Tony used ',
        stim4: ' of water. <p><strong>Did their landlord send them a bill this month?</strong></p>',
        alert: 'Remember that their landlord will send them a bill whenever Alison and Tony use over ' + unit(threshold, 'gallon') + ' of water in total.',
    },
    man_check: {
        c: 'How much does the amount of water used by Alison vary from month to month?',
        a: 'How much does the amount of water used by Tony vary from month to month?',
    },
    judgment: {
        reminder: 'As a reminder, their landlord will pay for Alison and Tony to use ' + unit(threshold, 'gallon') +
            ' of water. So, if Alison and Tony use more than ' + unit(threshold, 'gallon') +
            ' of water in a single month, their landlord will send them a bill.',
        vignette: 'This month, Alison used ' + unit(c, 'gallon') + ' of water and Tony used ' +
            unit(a, 'gallon') + ' of water. So, their landlord sent them a bill.',
        statement: 'Alison using ' + unit(c, 'gallon') + ' of water caused their landlord to send them a bill this month.'
    },
    vibe_check: {
        c: '<p><strong>To what extent did you expect Alison to use ' + unit(c, 'gallon') + ' of water?</strong></p>',
        a: '<br><p><strong>To what extent did you expect Tony to use ' + unit(a, 'gallon') + ' of water?</strong></p>',  
    }
}, {
    name: 'funding', units: 'student', interval: 'year', valence: 'positive',
    instructions: 'Williamsburg North and Williamsburg South are the two high schools in their district. ' +
        'Every year, each school sends some of their graduating students to different universities. ' +
        'To encourage college admissions, the state uses the number of students sent to a university to determine how much funding their district’s education program will get for the year. ' +
        '<br><br>So, if Williamsburg North and Williamsburg South together send over ' + unit(threshold, 'student') +
        ' to a university, their district will receive more education funding.' +
        '<strong>Williamsburg North and Williamsburg South each send ' + unit(mu_c, 'student') + ' to a university on average.</strong> So, their district' + normality(threshold) + 'receives more education funding.' +
        '<br><br>We will show you how many students the two schools sent to a university for ' + n_learning +
        ' separate years. For each year, you will be asked whether the district received more funding. <br><br> Please try to pay attention to how many students Williamsburg North and Williamsburg South send to a university each year.',
    learning: {
        stim1: 'Williamsburg North sent ',
        stim2: ' to a university.',
        stim3: 'Williamsburg South sent ',
        stim4: ' to a university. <p><strong>Did the district receive more funding this year?</strong></p>',
        alert: 'Remember that the district will receive more funding whenever Williamsburg North and Williamsburg South send over ' + unit(threshold, 'student') + ' to a university in total.',
    },
    man_check: {
        c: 'How much does the number of students that Williamsburg North sends to a university vary from year to year?',
        a: 'How much does the number of students that Williamsburg South sends to a university vary from year to year?',
    },
    judgment: {
        reminder: 'As a reminder, the district will receive more funding for education if Williamsburg North and Williamsburg South together send over ' + unit(threshold, 'student') + ' to a university.',
        vignette: 'This year, Williamsburg North sent ' + unit(c, 'student') + ' to a university and Williamsburg South sent ' + unit(a, 'student') + ' to a university. So, the district received more funding.',
        statement: 'Williamsburg North sending ' + unit(c, 'student') + ' to a university caused the district to receive more funding this year.'
    },
    vibe_check: {
        c: '<p><strong>To what extent did you expect Williamsburg North to send ' + unit(c, 'student') + ' to a university?</strong></p>',
        a: '<br><p><strong>To what extent did you expect Williamsburg South to send ' + unit(a, 'student') + ' to a university?</strong></p>',  
    }
}, {
    name: 'trucking', units: 'ton', interval: 'day', valence: 'negative',
    instructions: 'Ned is a trucker that delivers construction supplies for two clients, Hammerco and Brick Works. ' +
        'Every day, he receives an order from both companies to pick up bricks on the other side of Middleview river. ' +
        'To get there, he must cross the Middleview bridge which has a maximum weight capacity of ' + unit(threshold, 'ton') + 
        '. <br><br>So, if Hammerco and Brick Works need more than ' + unit(threshold, 'ton') + 
        ' of bricks, Ned has to take two trips across the river that day.' + '<strong>Hammerco and Brick Works each order ' + unit(mu_c, 'ton') + ' of bricks on average.</strong> So, Ned' + normality(threshold) + 'takes two trips across the river.' +
        '<br><br>We will show you how much brick Hammerco and Brick Works ordered on ' + n_learning +
        ' separate days. For each day, you will be asked whether Ned took two trips across the river. <br><br> Please try to pay attention to how many bricks Hammerco and Brick Works order each day.',
    learning: {
        stim1: 'Hammerco ordered ',
        stim2: ' of bricks.',
        stim3: 'Brick Works ordered ',
        stim4: ' of bricks. <p><strong>Did Ned take two trips across the river today?</strong></p>',
        alert: 'Remember that Ned takes two trips across the river whenever Hammerco and Brick Works order over ' + unit(threshold, 'ton') + ' of bricks in total.',
    },
    man_check: {
        c: 'How much does the amount of brick ordered by Hammerco vary from day to day?',
        a: 'How much does the amount of brick ordered by Brick Works vary from day to day?',
    },
    judgment: {
        reminder: 'As a reminder, the Middleview bridge can support a maximum of ' + unit(threshold, 'ton') + 
            '. So, if Hammerco and Brick Works order more than ' + unit(threshold, 'ton') + ' of bricks in total, Ned has to take two trips across the river that day.',
        vignette: 'Today, Hammerco ordered ' + unit(c, 'ton') + ' of brick and Brick Works ordered ' + unit(a, 'ton') + ' of brick. So, Ned took two trips across the river today.',
        statement: 'Hammerco ordering ' + unit(c, 'ton') + ' of brick caused Ned to take two trips across the river today.'
    },
    vibe_check: {
        c: 'To what extent did you expect Hammerco to order ' + unit(c, 'ton') + ' of bricks?',
        a: 'To what extent did you expect Brick Works to order ' + unit(a, 'ton') + ' of bricks?',
    } 
}, {
    name: 'running', units: 'mile', interval: 'month', valence: 'positive',
    instructions: 'Francine wants to help her friends Olivia and Mimi run more. To help achieve their goal, they agreed to a deal. ' +
        'At the start of each month, they will measure how many miles Olivia and Mimi each ran since the previous month. Their goal is to run ' +
        unit(threshold, 'mile') + ' combined each month. <br><br>So, if they run a total of more than ' + unit(threshold, 'mile') + 
        ' that month, Francine will bake them a cake. Francine will not bake a cake if they run less than ' + unit(threshold, 'mile') + ' that month.' +
        '<strong>Olivia and Mimi each run ' + unit(mu_c, 'mile') + ' on average.</strong> So, Francine' + normality(threshold) + 'bakes them a cake.' +
        '<br><br>We will show you how many miles Olivia and Mimi ran on ' + n_learning +
        ' separate months. For each month, you will be asked whether Francine baked them a cake. <br><br> Please try to pay attention to how many miles Olivia and Mimi run each day.',
    learning: {
        stim1: 'Olivia ran ',
        stim2: '.',
        stim3: 'Mimi ran ',
        stim4: '. <p><strong>Did Francine bake them a cake this month?</strong></p>',
        alert: 'Remember that Francine bakes Olivia and Mimi a cake whenever they run more than ' + unit(threshold, 'mile') + ' in total.',
    },
    man_check: {
        c: 'How much does the number of miles that Olivia runs vary from month to month?',
        a: 'How much does the number of miles that Mimi runs vary from month to month?',
    },
    judgment: {
        reminder: 'As a reminder, Olivia and Mimi set a goal to run a total of ' + unit(threshold, 'mile') + 
            ' each month. So, if Olivia and Mimi together run over ' + unit(threshold, 'mile') + ', then Francine will bake them a cake.',
        vignette: 'This month, Olivia ran ' + unit(c, 'mile') + ' and Mimi ran ' + unit(a, 'mile') + '.',
        statement: 'Olivia running ' + unit(c, 'mile') + ' caused Francine to bake a cake this month.'
    },
    vibe_check: {
        c: '<p><strong>To what extent did you expect Olivia to run ' + unit(c, 'mile') + '?</strong></p>',
        a: '<br><p><strong>To what extent did you expect Mimi to run ' + unit(a, 'mile') + '?</strong></p>',  
    }
}, {
    name: 'cellular', units: 'gigabyte', interval: 'month', valence: 'negative',
    instructions: 'To save money, Ricardo and Pierre are on a family cell phone plan. The plan has a cellular data limit of ' + 
        unit(threshold, 'gigabyte') + ' per month. <br><br> So, if Ricardo and Pierre together use more than ' +
        unit(threshold, 'gigabyte') + ' of data in a given month, then the cell company will charge them a data overage fee.' +
        '<strong>Ricardo and Pierre each use ' + unit(mu_c, 'gallon') + ' on average.</strong> So, Ricardo and Pierre are' + normality(threshold) + 'charged a fee.' +
        '<br><br>We will show you how much data Ricardo and Pierre used on ' + n_learning +
        ' separate months. For each month, you will be asked whether the company charged them a fee. <br><br> Please try to pay attention to how much data Ricardo and Pierre use each month.',
    learning: {
        stim1: 'Ricardo used ',
        stim2: ' of data.',
        stim3: 'Pierre used ',
        stim4: ' of data. <p><strong>Did the cell company charge them a fee this month?</strong></p>',
        alert: 'Remember that the cell company charges a data overage fee whenever Ricardo and Pierre use over ' + unit(threshold, 'gigabyte') + ' of data in total.',
    },
    man_check: {
        c: 'How much does the amount of data that Ricardo uses vary from month to month?',
        a: 'How much does the amount of data that Pierre uses vary from month to month?',
    },
    judgment: {
        reminder: 'As a reminder, the cell company will charge Ricardo and Pierre a data overage fee whenever they use over ' + unit(threshold, 'gigabyte') + ' of data in a month.',
        vignette: 'This month, Ricardo used ' + unit(c, 'gigabyte') + ' of data and Pierre used ' + unit(a, 'gigabyte') + ' of data. So, the cell company charged them a fee this month.',
        statement: 'Ricardo using ' + unit(c, 'gigabyte') + ' of data caused the cell company to charge them a fee this month.'
    },
    vibe_check: {
        c: '<p><strong>To what extent did you expect Ricardo to use ' + unit(c, 'gigabyte') + ' of data?</strong></p>',
        a: '<br><p><strong>To what extent did you expect Pierre to use ' + unit(a, 'gigabyte') + ' of data?</strong></p>',  
    }
}]

/* Randomly assign a condition */
var id = jsPsych.randomization.randomID();
//var vignette = jsPsych.randomization.sampleWithoutReplacement(vignettes, 1)[0];
var vignette = vignettes[0];  // use to pre-select a specific vignette

console.log('ID: ' + id);
console.log('Vignette: ' + vignette.name);
console.log('sd_c: ' + sd_c);
console.log('threshold: ' + threshold);

/* Capture info from Prolific */
jsPsych.data.addProperties({
    id: id, mu_c: mu_c, mu_a: mu_a, sd_c: sd_c, sd_a: sd_a, 
    threshold: threshold, c: c, a: a, n_learning: n_learning,
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

/* run learning trials */
var current_trial = 0;  // counter for current trial in block
var learning_block = {
    timeline: [{
        timeline: [{
            type: jsPsychHtmlButtonResponse,
            choices: ['No', 'Yes'],
            button_html: '<button class="jspsych-btn" disabled>%choice%</button>',
            stimulus: function () {
                return '<p align="left">' + capitalize(vignette.interval) + ' ' + (current_trial+1) + ' of ' + n_blocks*n_learning + ':</p>' +
                    vignette.learning.stim1 + unit(learning_params[current_trial].c, vignette.units) +
                    vignette.learning.stim2 + '<br>' + vignette.learning.stim3 +
                    unit(learning_params[current_trial].a, vignette.units) + vignette.learning.stim4;
            },
            on_load: function () {
                setTimeout(function() {
                    document.querySelectorAll('.jspsych-btn').forEach(function(button) {
                        button.disabled = false;
                    });
                }, 1000); // 1000ms delay before showing buttons
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
                let header = '<p align="left">' + capitalize(vignette.interval) + ' ' + d.trial + ' of ' + n_blocks*n_learning + ':</p>';
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
    pages: ['Great work, you finished block ' + (learning_params[current_trial].block + 1) +
            ' of ' + n_blocks + '!']
}

/* display manipulation check */
var man_check_c = {
    type: jsPsychHtmlSliderResponse,
    stimulus: '<strong>' + vignette.man_check.c + '</strong>',
    min: 0, max: 1, step: 'any', require_movement: true, labels: ['not at all', 'totally random'],
    // Hide the slider thumb until response
    on_load: function () {
        document.getElementById('jspsych-html-slider-response-response').classList.add('hidden');
        document.getElementById('jspsych-html-slider-response-response').addEventListener('click', function (e) {
            e.target.classList.remove('hidden');
        });
    },
    data: function () {
        return {
            measure: 'manipulation_check',
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
    min: 0, max: 1, step: 'any', require_movement: true, labels: ['not at all', 'totally random'],
    // Hide the slider thumb until response
    on_load: function () {
        document.getElementById('jspsych-html-slider-response-response').classList.add('hidden');
        document.getElementById('jspsych-html-slider-response-response').addEventListener('click', function (e) {
            e.target.classList.remove('hidden');
        });
    },
    data: function () {
        return {
            measure: 'manipulation_check',
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

/*display judgment */
var judgment = {
    type: jsPsychHtmlSliderResponse,
    stimulus: '<p>' + vignette.judgment.reminder + '</p><p>' +
        vignette.judgment.vignette +
        '</p><br><p><strong>To what degree do you agree with the following statement?</strong></p><p>' +
        vignette.judgment.statement
    ,
    min: 0, max: 1, step: 'any', require_movement: true, labels: ['not at all', 'totally'],
    // Hide the slider thumb until response
    on_load: function () {
        document.getElementById('jspsych-html-slider-response-response').classList.add('hidden');
        document.getElementById('jspsych-html-slider-response-response').addEventListener('click', function (e) {
            e.target.classList.remove('hidden');
        });
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
jsPsych.run([consent, instructions, learning_stage, judgment, confidence, justification, vibes_c, vibes_a, age, gender, attn_check, comments]);