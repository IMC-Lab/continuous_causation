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
            'experimentName': 'experiment1',
            'curData': data.csv()
        };
        await $.post("https://dibs-web01.vm.duke.edu/debrigard/continuous_causation/exp/save.php",
            dataToServer,
            function (data) {
                document.getElementById('done').style.visibility = "visible";

                // Re-direct back to Prolific if  is present
                if (jsPsych.data.getURLVariable('PROLIFIC_PID') != null)
                    setTimeout(function () {
                        window.location = "https://app.prolific.co/submissions/complete?cc=XXXXXXXXX";
                    }, 3000);
            }).promise().catch(function () { });
    }
});

var mu_c = 1;
var mu_a = 1;
var sd_c = 1;
var sd_a = 1;
var threshold = 3;
var c = 1;
var a = 1;
var n_learning = 4;

var learning_params = new Array(n_learning);
for (let i = 0; i < n_learning; i++) {
    let c = sampleNormal(mu_c, sd_c);
    let a = sampleNormal(mu_a, sd_a);
    let e = c + a > threshold;
    learning_params[i] = { trial: i + 1, c: c, a: a, e: e }
}

/* A complete list of all vignettes */
var vignettes = [{
    name: 'sewage', units: 'gallon', interval: 'day', valence: 'negative',
    instructions: "There are two plants, Plant A and Plant B, in the small town of Huxley. Every day, both plants send their sewage to the town's water treatment facility. The water facility is capable of filtering " +
        unit(threshold, 'gallon') + ' of sewage per day. So, if Plant A and Plant B together produce more than ' + unit(threshold, 'gallon') +
        ' of sewage on a given day, then some pollution will leak out into the river. <br><br>We will show you how much sewage each of the two plants produced on ' + n_learning +
        ' separate days. For each day, you will be asked whether some pollution leaked out into the river.<br><br><strong>Please try to pay attention to how much each plant produces on average.</strong>',
    learning: {
        stim1: 'Plant A sent ',
        stim2: ' of sewage to the water treatment plant. ',
        stim3: '<p>Plant B sent ',
        stim4: ' of sewage to the water treatment plant.<p><strong>Did the water treatment plant leak sewage into the river today?</strong></p>',
        alert: 'Remember that the treatment plant leaks sewage whenever the total amount of sewage exceeds ' + threshold + ' gallons.',
    },
    man_check: {
        c: "How many gallons of sewage does Plant A produce on average?",
        a: "How many gallons of sewage does Plant B produce on average?",
    },
    judgment: {
        reminder: 'As a reminder, the water facility is capable of filtering ' + unit(threshold, 'gallon') +
            ' of sewage per day. So, if Plant A and Plant B together produce more than ' + unit(threshold, 'gallon') +
            ' of sewage, then some pollution will leak out into the river.',
        vignette: 'On this day, Plant A sent ' + unit(c, 'gallon') + ' of sewage to the water treatment plant and Plant B sent ' + 
            unit(a, 'gallon') + ' of sewage to the water treatment plant. So, the river became polluted.',
        statement: 'Plant A producing ' + unit(c, 'gallon') + ' of sewage caused the river to become polluted.'
    }
}, {
    name: 'sales', units: 'ream', interval: 'day', valence: 'positive',
    instructions: "There are two employees, Susan and Mike, in the sales department of their paper company’s local branch. Every day, both employees try to sell as many reams of paper as possible. " +
        'The local branch must sell over ' + unit(threshold, 'ream') + ' of paper in order to make any profit for their company. So, if Susan and Mike together sell at least ' +
        unit(threshold, 'ream') + ' of paper, then their branch will make a profit for that day. <br><br>We will show you how many reams of paper each of the two employees sold on ' + n_learning +
        ' separate days. For each day, you will be asked whether the branch made a profit.<br><br><strong>Please try to pay attention to how many reams of paper each employee sold on average.</strong>',
    learning: {
        stim1: 'Susan sold ',
        stim2: ' of paper for the branch.',
        stim3: '<p>Mike sold ',
        stim4: ' of paper for the branch. <p><strong>Did the branch make a profit today?</strong></p>',
        alert: 'Remember that the local branch makes a profit whenever the total amount of paper exceeds ' + threshold + ' reams.',
    },
    man_check: {
        c: 'How many reams of paper does Susan sell on average?',
        a: 'How many reams of paper does Mike sell on average?',
    },
    judgment: {
        reminder: 'As a reminder, each day the local branch of the company will make a profit if Susan and Mike together sell over ' +
            unit(threshold, 'ream') + ' of paper.',
        vignette: 'On this day, Susan sold ' + unit(c, 'ream') + ' of paper and Mike sold ' + 
            unit(a, 'ream') + ' of paper. So, the branch made a profit.',
        statement: 'Susan selling ' + unit(c, 'ream') + ' of paper caused the branch to make a profit.'
    }
}, {
    name: 'basketball', units: 'point', interval: 'game', valence: 'positive',
    instructions: "There are two basketball players, Max and Carl, who are the two main scorers on their school’s basketball team. Every game, both players try to score as many points as possible. " +
        'The coach has promised to take the team out for ice cream after any game in which they score over ' + unit(threshold, 'point') + '. So, if Max and Carl together score over ' +
        unit(threshold, 'point') + ' during a game, the coach will take the team out for ice cream. <br><br>We will show you how many points each of the two basketball players scored during ' + [n_learning] +
        ' separate games. For each game, you will be asked whether the team went out for ice cream after the game. <br><br><strong>Please try to pay attention to how much each player scores on average. </strong>',
    learning: {
        stim1: 'Max scored ',
        stim2: ' during this game.',
        stim3: ' Carl scored ',
        stim4: ' during this game. <p><strong>Did the coach take the team out for ice cream today?</strong></p>',
        alert: 'Remember that the team goes out for ice cream whenever the total amount of points exceeds ' + threshold + ' points.',
    },
    man_check: {
        c: 'How many points does Max score on average?',
        a: 'How many points does Carl score on average?',
    },
    judgment: {
        reminder: 'As a reminder, the coach will take the team out for ice cream if Max and Carl together score over ' + unit(threshold, 'point') + '.',
        vignette: 'During the game today, Max scored ' + unit(c, 'point') + ' and Carl scored ' + unit(a, 'point') + '. So, the coach took the team out for ice cream.',
        statement: 'Max scoring ' + unit(c, 'point') + ' during the game caused the coach to take the team out for ice cream.'
    }
}, {
    name: 'drive', units: 'canned good', interval: 'day', valence: 'positive',
    instructions: 'Ms. Sampson is hosting a food drive for her class. Rachel and Jim are the only students in the class that bring in canned goods. Ms. Sampson has told the class that they will receive 15 extra minutes of recess when they bring in over ' +
        unit(threshold, 'canned good') + '. So, if Rachel and Jim together bring in over ' + unit(threshold, 'canned good') +
        ', the class will receive 15 extra minutes of recess. <br><br>We will show you how many canned goods each of the two students brought in on ' +
        n_learning + ' separate days. For each day, you will be asked whether the class received 15 extra minutes of recess. <br><br><strong>Please try to pay attention to how many canned goods each student brings in on average. </strong>',
    learning: {
        stim1: 'Rachel brought in ',
        stim2: ' for the food drive. ',
        stim3: 'Jim brought in ',
        stim4: ' for the food drive.<p><strong>Did the class receive 15 extra minutes of recess?</strong></p>',
        alert: 'Remember that the class receives 15 extra minutes of recess whenever the total amount of canned goods exceeds ' + threshold + ' canned goods.',
    },
    man_check: {
        c: 'How many canned goods does Rachel bring to class on average?',
        a: 'How many canned goods does Jim bring to class on average?',
    },
    judgment: {
        reminder: "As a reminder, the class will receive 15 extra minutes of recess whenever the total number of canned goods brought in exceeds " + unit(threshold, 'canned good') + ".",
        vignette: 'Today, Rachel brought in ' + unit(c, 'canned good') + ' and Jim brought in ' +
            unit(a, 'canned good') + '. So, the class received 15 extra minutes of recess.',
        statement: 'Rachel bringing in ' + unit(c, 'canned good') + ' to class caused the class to receive 15 extra minutes of recess.'
    }
}, {
    name: 'savings', units: 'dollar', interval: 'month', valence: 'positive',
    instructions: 'Luke and Lisa have a joint savings account together. Every month, they each add money to their account. If Luke and Lisa together save over ' +
        unit(threshold, 'dollar') + ' that month, they will go out to a nice dinner together to celebrate. <br><br>We will show you how much money each person saved for ' +
        n_learning + ' separate months. For each month, you will be asked whether Luke and Lisa went out to a nice dinner. <br><br><strong>Please try to pay ' +
        'attention to how much money each person saves on average. </strong>',
    learning: {
        stim1: 'Luke saved ',
        stim2: ' during this month. ',
        stim3: 'Lisa saved ',
        stim4: ' during this month.<p><strong>Did they take themselves out to a nice dinner?</strong></p>',
        alert: 'Remember that Luke and Lisa go out for a nice dinner whenever the total amount of money saved exceeds ' + threshold + ' dollars.',
    },
    man_check: {
        c: 'How much money does Luke save on average?',
        a: 'How much money does Lisa save on average?',
    },
    judgment: {
        reminder: 'As a reminder, Luke and Lisa will go out to a nice dinner together whenever they save over ' + 
            unit(threshold, 'dollar') + ' for that month.',
        vignette: 'During this month, Luke saved ' + unit(c, 'dollar') + ', and Lisa saved ' + 
            unit(a, 'dollar') + '. So, they went out to a nice dinner to celebrate.',
        statement: 'Luke saving ' + unit(c, 'dollar') + ' caused him and Lisa to go out for a nice dinner.'
    }
}, {
    name: 'bus', units: 'minute', interval: 'day', valence: 'negative',
    instructions: 'Sam and Jeffrey are siblings. Every morning, they catch the bus to their school together. When they wake up, they take turns getting ready in the bathroom. If Sam and Jeffrey together take longer than ' +
        unit(threshold, 'minute') + ' to get ready, then they will miss their bus to school. <br><br>We will show you how many minutes each sibling took to get ready on ' +
        n_learning + ' separate days. For each day, you will be asked whether they missed their bus. <br><br><strong>Please try to pay' +
        ' attention to how long each sibling takes to get ready on average. </strong>',
    learning: {
        stim1: 'Sam took ',
        stim2: ' to get ready this morning. ',
        stim3: 'Jeffrey took ',
        stim4: ' to get ready this morning.<p><strong> Did they miss the bus today?</strong></p>',
        alert: 'Remember that Sam and Jeffrey miss their bus whenever the total amount of time exceeds ' + threshold + ' minutes.',
    },
    man_check: {
        c: "How long does Sam take to get ready on average?",
        a: "How long does Jeffrey take to get ready on average?",
    },
    judgment: {
        reminder: 'As a reminder, Sam and Jeffrey will miss their bus if they take over ' + unit(threshold, 'minute') + ' to get ready.',
        vignette: 'On this day, Sam took ' + unit(c, 'minute') + ' to get ready and Jeffrey took ' + unit(a, 'minute') + ' to get ready. So, they missed their bus.',
        statement: 'Sam taking ' + unit(c, 'minute') + ' to get ready caused him and Jeffrey to miss their bus.'
    }
}, {
    name: 'power', units: 'megawatt', interval: 'day', valence: 'negative',
    instructions: 'Town A and Town B are the two towns supplied by the local power grid. The local power grid is able to supply up to ' +
        unit(threshold, 'megawatt') + ' of electricity per day. If both towns together use more than ' + unit(threshold, 'megawatt') + ' of electricity per day, the power grid will shut down.' +
        ' <br><br>We will show you how much electricity each of the two towns used on ' + n_learning + ' separate days. For each day, you will be asked whether the power grid temporarily shut down. ' +
        '<br><br><strong> Please try to pay attention to how much electricity each town uses on average.</strong>',
    learning: {
        stim1: 'Town A used ',
        stim2: ' of electricity. ',
        stim3: 'Town B used ',
        stim4: ' of electricity.<p><strong> Did the power grid shut down today?</strong></p>',
        alert: 'Remember that the power grid will shut down whenever the total amount of energy used exceeds ' + threshold + ' megawatts per day.',
    },
    man_check: {
        c: 'How much electricity does Town A use on average?',
        a: 'How much electricity does Town B use on average?',
    },
    judgment: {
        reminder: 'As a reminder, the power grid is able to supply up to ' + unit(threshold, 'megawatt') + 
            ' of electricity at any given time. So, if Towns A and B together use over ' + unit(threshold, 'megawatt') + 
            ' of  electricity, there will not be enough power to supply the towns, and the power grid will temporarily shut down.',
        vignette: 'Today, Town A used ' + unit(c, 'megawatt') + ' of electricity, and Town B used ' + unit(a, 'megawatt') + ' of electricity. So, the power grid shut down.',
        statement: 'Town A using ' + unit(c, 'megawatt') + ' of electricity caused the power grid to shut down.'
    }
}, {
    name: 'water', units: 'gallon', interval: 'day', valence: 'negative',
    instructions: 'Alison and Tony live together in a cabin outside of town. Their cabin has a water tank that automatically refills over the course of a day. The water tank holds ' +
        unit(threshold, 'gallon') + ' when it is completely full. If more than ' + unit(threshold, 'gallon') + ' are used, then the water will no longer run in their cabin. ' +
        'So, if Alison and Tony together use more than ' + unit(threshold, 'gallon') + ' of water, the water will no longer run in their cabin. ' +
        '<br><br>We will show you how much water Tony and Alison used on ' + n_learning + ' separate days. For each day, you will be asked whether the cabin ran out of water.' +
        '<br><br><strong> Please try to pay attention to how much water each person uses on average. </strong>',
    learning: {
        stim1: 'Alison used ',
        stim2: ' of water.',
        stim3: ' Tony used ',
        stim4: ' of water.<p><strong> Did the cabin run out of water today?</strong></p>',
        alert: 'Remember that the tank will run out of water whenever the total amount of water used exceeds ' + threshold + ' gallons per day.',
    },
    man_check: {
        c: 'How much water does Alison use on average?',
        a: 'How much water does Tony use on average?',
    },
    judgment: {
        reminder: 'As a reminder, the water tank holds ' + unit(threshold, 'gallon') +
            ' of water when it is completely filled. So, if Alison and Tony use more than ' + unit(threshold, 'gallon') +
            ' of water in a single day, the water will no longer run in their cabin.',
        vignette: 'Today, Alison used ' + unit(c, 'gallon') + ' of water, ' + ' and Tony used ' + 
            unit(a, 'gallon') + ' of water. So, the cabin ran out of water.',
        statement: 'Alison using ' + unit(c, 'gallon') + ' of water caused the cabin to run out of water.'
    }
}, {
    name: 'funding', units: 'point', interval: 'year', valence: 'positive',
    instructions: 'School A and School B are the two high schools in their district.' +
        ' Every year, their students take exams to see how they rank with the rest of the schools in their state.' +
        ' The state uses the two schools’ combined test scores to determine how much funding their district’s education program will get for the year.' +
        ' So, if School A and School B together score over ' + unit(threshold, 'point') + ', their district will receive more education funding.' +
        '<br><br>We will show you how many points each of the two schools scored for ' + n_learning +
        ' separate years. For each year, you will be asked whether the district received more funding.' +
        '<br><br><strong> Please try to pay attention to how many points each school scores on average. </strong>',
    learning: {
        stim1: 'School A scored ',
        stim2: ' on the test. ',
        stim3: 'School B scored ',
        stim4: ' on the test. <p><strong>Did the district receive more funding this year?</strong></p>',
        alert: 'Remember that the district will receive more funding whenever the total amount points scored exceeds ' + threshold + ' points.',
    },
    man_check: {
        c: 'How many points does School A score on average?',
        a: 'How many points does School B score on average?',
    },
    judgment: {
        reminder: 'As a reminder, the district will receive more funding for education if Schools A and B together score over ' + unit(threshold, 'point') + '.',
        vignette: 'For this year, School A scored ' + unit(c, 'point') + ', and School B scored ' + unit(a, 'point') + '. So, the district will receive more funding.',
        statement: 'School A scoring ' + unit(c, 'gallon') + ' on the exam caused the district to receive more funding.'
    }
}, {
    name: 'airplane', units: 'lb', interval: 'flight', valence: 'negative',
    instructions: 'Sky Airlines is a flight company. For each of their flights, half the passengers are always in first class and the other half are always in economy. Every flight, the total weight of checked bags is measured for each group.' +
        ' The plane can carry up to ' + unit(threshold, 'lb') + ' of checked bags for every flight. If the total weight of checked bags for a given flight exceeds ' + unit(threshold, 'lb') +
        ', the flight will be delayed. <br><br> We will show you how much baggage the first class and economy class passengers checked in on ' +
        n_learning + ' separate flights. For each flight, you will be asked whether the flight was delayed.' +
        '<br><br><strong> Please try to pay attention to how much checked baggage the first class and economy group packed on average. </strong>',
    learning: {
        stim1: 'The first class group packed ',
        stim2: ' of checked baggage.',
        stim3: 'The economy group packed ',
        stim4: ' of  checked baggage. <p><strong>Was the flight delayed?</strong></p>',
        alert: 'Remember that the flight will be delayed whenever the total amount of checked baggage packed exceeds ' + unit(threshold, 'lb') + '.',
    },
    man_check: {
        c: 'How much checked baggage did passengers in the first class group pack on average?',
        a: 'How much checked baggage did passengers in the economy group pack on average?',
    },
    judgment: {
        reminder: 'As a reminder, the plane is capable of carrying ' + unit(threshold, 'lb') + 
            ' of checked baggage every flight. So, if the total weight of checked bags for a given flight exceeds ' +
            unit(threshold, 'lb') + ', the flight will be delayed.',
        vignette: 'On the current flight, the first class group packed ' + unit(c, 'lb') + ' of checked baggage, and the economy group packed ' +
            unit(threshold, 'lb') + ' of checked baggage. So, the flight was delayed.',
        statement: 'The first class group packing ' + unit(c, 'lb') + ' of checked baggage caused the flight to be delayed.'
    }
}]

/* Randomly assign a condition */
var id = jsPsych.randomization.randomID();
var vignette = vignettes[0];
//var vignette = jsPsych.randomization.sampleWithoutReplacement(vignettes, 1)[0];
console.log('ID: ' + id);
console.log('Vignette: ' + vignette.name);

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
    pages: [`<p>In this study, you will be asked to read some scenarios and to answer questions about those scenarios.</p> 
        Pay attention, because you will receive a bonus payment of up to $4 if you answer these questions more accurately than other participants.`,
        vignette.instructions]
}

function sampleNormal(mean, sd, min = 0, max = Infinity) {
    let s = Math.round(jStat.normal.sample(mean, sd));
    while (s < min || s > max)
        s = Math.round(jStat.normal.sample(mean, sd));
    return s;
}

/* run learning trials */
var learning = {
    timeline: [{
        timeline: [{
            type: jsPsychHtmlButtonResponse,
            choices: ['No', 'Yes'],
            stimulus: function () {
                return '<p align="left">' + capitalize(vignette.interval) + ' ' + jsPsych.timelineVariable('trial') + ' of ' + n_learning + ':</p>' +
                    vignette.learning.stim1 + unit(jsPsych.timelineVariable('c'), vignette.units) + 
                    vignette.learning.stim2 + '<br>' + vignette.learning.stim3 + 
                    unit(jsPsych.timelineVariable('a'), vignette.units) + vignette.learning.stim4;
            },
            data: {
                trial: jsPsych.timelineVariable('trial'),
                c: jsPsych.timelineVariable('c'),
                a: jsPsych.timelineVariable('a'),
                e: jsPsych.timelineVariable('e'),
            }
        }, {
            type: jsPsychInstructions,
            show_clickable_nav: true,
            pages: function () {
                let d = jsPsych.data.getLastTrialData().values()[0];
                let header = '<p align="left">' + capitalize(vignette.interval) + ' ' + d.trial + ' of ' + n_learning + ':</p>';
                if (d.response == d.e)
                    return [ header + '<p style="font-weight: bold; color: green;">Correct!</p>' ];
                
                return [ header + '<p style="font-weight: bold; color: red;">Incorrect, please try again.</p>' + 
                         '<p>' + vignette.learning.alert + '</p>'];
            }
        }],
        loop_function: function (data) {
            return data.values()[0].response != data.values()[0].e;
        }
    }],
    timeline_variables: learning_params
}

/*display manipulation check */
var man_check = {
    timeline: [{
        type: jsPsychSurveyText,
        questions: [
            { name: 'average_c', prompt: vignette.man_check.c, required: true },
            { name: 'average_a', prompt: vignette.man_check.a, required: true }],
        on_finish: function (data) {
            data.measure = 'manipulation_check';
            data.response_c = parseFloat(data.response.average_c);
            data.response_a = parseFloat(data.response.average_a);
        }
    }],
    loop_function: function (data) {
        let response_c = parseFloat(data.values()[0].response_c);
        if (isNaN(response_c)) alert("Please enter your response for the first question as a number.");
        if (!isNaN(response_c) & (response_c <= 0 || response_c > 150)) alert("Please enter a valid number of " + vignette.units + "s for the first question.");
        let response_a = parseFloat(data.values()[0].response_a);
        if (isNaN(response_a)) alert("Please enter your response for the second question as a number.");
        if (!isNaN(response_a) & (response_a <= 0 || response_a > 150)) alert("Please enter a valid number of " + vignette.units + "s for the second question.");
        return isNaN(response_c) || response_c <= 0 || response_c > 150 || isNaN(response_a) || response_a <= 0 || response_a > 150;
    }
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

/* start the experiment */
jsPsych.run([consent, instructions, learning, man_check, judgment, confidence, age, gender, attn_check, comments]);