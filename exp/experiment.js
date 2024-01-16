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
var n_learning = 10;

var learning_params = new Array(n_learning);
for (let i = 0; i<n_learning; i++) {
    let c = sampleNormal(mu_c, sd_c);
    let a = sampleNormal(mu_a, sd_a);
    let e = c+a > threshold;
    learning_params[i] = { trial: i+1, c: c, a: a, e: e }
}



/* A complete list of every possible vignette */
var vignettes = [{
    name: 'water plant',
    instructions: "There are two plants, Plant A and Plant B, in the small town of Huxley. Every day, both plants send their sewage to the town's water treatment facility. The water facility is capable of filtering " + 
    unit(threshold, 'gallon') + " of sewage per day. So, if Plant A and Plant B together produce more than " + unit(threshold, 'gallon') + 
    " of sewage, then some pollution will leak out into the town’s river. <br><br>We will show you how much sewage each of the two plants produced on " + n_learning + 
    " separate days. For each day, you will be asked whether some pollution will leak out into the town’s river.<br><br><strong>Please try to pay attention to how much each plant produces on average.</strong>",
    units: "gallon",
    learning: {
        stim1: 'Plant A sent ' ,
        stim2: ' of sewage to the water treatment plant. ',
        stim3: '<p>Plant B sent ',
        stim4:  ' of sewage to the water treatment plant.<p><strong>Did the water treatment plant leak sewage into the river today?</strong></p>',
        alert: 'Incorrect response, please try again.\n\nRemember that the treatment plant leaks sewage whenever the total amount of sewage exceeds ' + threshold + ' gallons.',
    },
    man_check: {
        c: "How many gallons of sewage does Plant A produce on average?",
        a: "How many gallons of sewage does Plant B produce on average?",
    },
    judgment_stim: "<p>As a reminder, the water facility is capable of filtering " + unit(threshold, 'gallon') + " of sewage per day. So, if Plant A and Plant B together produce more than " + unit(threshold, 'gallon') + 
    " of sewage, then some pollution will leak out into the town’s river. On this day, Plant A sent " + unit(c, 'gallon') + " of sewage to the water treatment plant, and Plant B sent " + unit(a, 'gallon') +
    " of sewage to the water treatment plant. So, the town's river became polluted. <br> <br/> To what extent do you agree with the following statement? <br> <br/> Plant A producing " + unit(c, 'gallon') + " of sewage caused the town’s water to become polluted. <p/>"
  },{
    name: "sales" ,
    instructions: "There are two employees, Susan and Mike, in the sales department of their paper company’s local branch. Every day, both employees try to sell as many reams of paper as possible. " +
     "The local branch must sell over " + unit(threshold, 'ream') + " of paper in order to make any profit for their company. So, if Susan and Mike together sell at least " +
      unit(threshold, 'ream') + " of paper, then their branch will make a profit for that day. <br><br>We will show you how many reams of paper each of the two employees sold on " + n_learning + 
      " separate days. For each day, you will be asked whether the branch made a profit.<br><br><strong>Please try to pay attention to how many reams of paper each employee sold on average.</strong>",
    units: "ream" ,
    learning: {
        stim1: "Susan sold ",
        stim2: " of paper for the branch.",
        stim3: "<p>Mike sold ",
        stim4: " of paper for the branch. <p><strong>Did the branch make a profit today?</strong></p>",
        alert: 'Incorrect response, please try again.\n\nRemember that the local branch makes a profit whenever the total amount of paper exceeds ' + threshold + ' reams.' ,
    },
    man_check:{
        c: "How many reams of paper does Susan sell on average?",
        a: "How many reams of paper does Mike sell on average?",
    },
    judgment_stim: "As a reminder, the local branch of the company will make a profit if Susan and Mike together sell over " +
     unit(threshold, 'ream') + " of paper. On this day, Susan sold " + unit(c, 'ream') + " of paper, and Mike sold " + unit(a, 'ream') + " of paper. So, the branch made a profit. <br> <br/> To what extent do you agree with the following statement? <br> <br/> Susan selling " + unit(c, 'ream') + " of paper caused the branch to make a profit."
  },{
    name: "basketball games",
    instructions: "There are two basketball players, Max and Carl, who are the two main scorers on their school’s basketball team. Every game, both players try to score as many points as possible. " +
    "The coach has promised to take the team out for ice cream after any game in which they score over " + unit(threshold, 'point') + ". So, if Max and Carl together score over " +
    unit(threshold, 'point') + " during a game, the coach will take the team out for ice cream. <br><br>We will show you how many points each of the two basketball players scored during " + [n_learning] +
    " separate games. For each day, you will be asked whether the team went out for ice cream after the game. <br><br><strong>Please try to pay attention to how much each player scores on average. </strong>" ,
    units: "point",
    learning: {
        stim1: 'Max scored ',
        stim2: ' during this game.',
        stim3: ' Carl scored ',
        stim4: ' during this game. <p><strong>Did the coach take the team out for ice cream today?</strong></p>',
        alert: 'Incorrect response, please try again.\n\nRemember that the team goes out for ice cream whenever the total amount of points exceeds ' + threshold + ' points.' ,
    },
    man_check: {
        c: "How many points does Max score on average?",
        a: "How many points does Carl score on average?",
    },
    judgment_stim: 'As a reminder, the coach will take the team out for ice cream if Max and Carl together score over ' + unit(threshold, 'point') 
    + '. On this day, Max scored ' + unit(c, 'point') + ', and Carl scored ' + unit(a, 'point') + ' during the game. So, the coach took the team out for ice cream. <br> <br/> To what extent do you agree with the following statement? <br> <br/> Max scoring ' 
    + unit(c, 'point') + ' during the game caused the coach to take the team out for ice cream.'
  },{
    name: 'food drive',
    instructions: 'Ms. Sampson is hosting a food drive for her class. Rachel and Jim are the only students in the class that bring in canned goods. Ms. Sampson has told the class that they will receive 15 extra minutes of recess when they bring in over '
     + unit(threshold, 'canned good') + '. So, if Rachel and Jim together bring in over ' + unit(threshold, 'canned good') 
     + ' , the class will receive 15 extra minutes of recess. <br><br>We will show you how many canned goods each of the two students brought in on ' 
     + n_learning + ' separate days. For each day, you will be asked whether the class received 15 extra minutes of recess. <br><br><strong>Please try to pay attention to how many canned goods each student brings in on average. </strong>' ,
    units: 'canned good',
    learning:{
        stim1: 'Rachel brought in ',
        stim2: ' for the food drive. ',
        stim3: 'Jim brought in ',
        stim4: ' for the food drive.<p><strong>Did the class receive 15 extra minutes of recess?</strong></p>',
        alert: 'Incorrect response, please try again.\n\nRemember that the class receives 15 extra minutes of recess whenever the total amount of canned goods exceeds ' + threshold + ' canned goods.',
    },
    man_check:{
        c: "How many canned goods does Rachel bring to class on average?",
        a: "How many canned goods does Jim bring to class on average?",
    },
    judgment_stim: 'As a reminder, the class will receive 15 extra minutes of recess whenever the total number of canned goods brought in exceeds ' 
    + unit(threshold, 'canned good') + '. Today, Rachel brought in ' + unit(c, 'canned good') + ' and Jim brought in ' + unit(a, 'canned good') 
    + '. So, the class received 15 extra minutes of recess. <br> <br/> To what extent do you agree with the following statement? <br> <br/> Rachel bringing in ' 
    + unit(c, 'canned good') + ' to class caused the class to receive 15 extra minutes of recess.'
  },{
    name: 'savings account' ,
    instructions: 'Luke and Lisa have a joint savings account together. Every month, they each add money to their account. If Luke and Lisa together save over  '
    + unit(threshold, 'dollar') + ', they will go out to a nice dinner together to celebrate. <br><br>We will show you how much money each person saved for ' 
    + n_learning + ' separate months. For each month, you will be asked whether Luke and Lisa went out to a nice dinner. <br><br><strong>Please try to pay '
    + 'attention to how much money each person saves on average. </strong>' ,
    units: 'dollar' ,
    learning:{
        stim1: 'Luke saved ',
        stim2: ' during this month. ',
        stim3: 'Lisa saved ',
        stim4: ' during this month.<p><strong>Did they take themselves out to a nice dinner?</strong></p>',
        alert: 'Incorrect response, please try again.\n\nRemember that Luke and Lisa go out for a nice dinner whenever the total amount of money saved exceeds ' + threshold + ' dollars.',
    },
    man_check:{
        c: "How much money does Luke save on average?",
        a: "How much money does Lisa save on average?",
    },
    judgment_stim: ' As a reminder, Luke and Lisa will go out to a nice dinner together whenever they save over ' + unit(threshold, 'dollar') + ' . During this month, Luke saved '
    + unit(c, 'dollar') + ', and Lisa saved ' + unit(a, 'dollar') + '. So, they will go out to a nice dinner to celebrate.<br> <br/> To what extent do you agree with the following statement? <br> <br/> Luke saving ' 
    + unit(c, 'dollar') + ' caused him and Lisa to go out for a nice dinner.'
  },{
    name:'missed bus',
    instructions: 'Sam and Jeffrey are siblings. Every morning, they catch the bus to their school together. When they wake up, they take turns getting ready in the bathroom. If Sam and Jeffrey together take longer than '
    + unit(threshold, 'minute') + ' to get ready, then they will miss their bus to school. <br><br>We will show you how many minutes each sibling took to get ready on '
    + n_learning + ' separate days. For each day, you will be asked whether they missed their bus. <br><br><strong>Please try to pay'
    + ' attention to how long each sibling takes to get ready on average. </strong>' ,
    units: 'minute',
    learning:{
        stim1: 'Sam took ',
        stim2: ' to get ready this morning. ',
        stim3: 'Jeffrey took ',
        stim4: ' to get ready this morning.', 
        alert: 'Incorrect response, please try again.\n\nRemember that Sam and Jeffrey miss their bus whenever the total amount of time exceeds ' + threshold + ' minutes.',
    },
    man_check:{
        c: "How long does Sam take to get ready on average?",
        a: "How long does Jeffrey take to get ready on average?",
    },
    judgment_stim: 'As a reminder, Sam and Jeffrey will miss their bus if they take over ' + unit(threshold, 'minute') + ' to get ready. On this day, Sam took '
    + unit(c, 'minute') + ' to get ready, and Jeffrey took ' + unit(a, 'minute') + ' to get ready. So, they missed their bus.<br> <br/> To what extent do you agree with the following statement? <br> <br/> Sam taking ' 
    + unit(c, 'minute') + ' to get ready caused him and Jeffrey to miss their bus.'
  },{
    name: 'power grid',
  instructions: 'Plant A and Plant B are the biggest energy facilities in the town of Williamsburg. The power grid of Williamsburg is able to supply up to '
   + unit(threshold, 'volt') + ' of electricity per day. If both plants together use more than ' + unit(threshold, 'volt') + ' of electricity per day, the power grid will shut down.' +
   ' <br><br>We will show you how much electricity each of the two plants used on ' + n_learning + ' separate days. For each day, you will be asked whether the power grid temporarily shut down. '
   + '<br><br><strong> Please try to pay attention to how much electricity each plant uses on average. </strong>' ,
  units: 'volt',
 learning:{
      stim1: 'Plant A used ',
      stim2: ' of electricity. ',
      stim3: 'Plant B used ',
      stim4: ' of electricity.<p><strong> Did the power grid shut down today?</strong></p>', 
      alert: 'Incorrect response, please try again. \n\nRemember that the power grid will shut down whenever the total amount of energy used exceeds ' + threshold + ' volts per day.',
  },
  man_check:{
      c: 'How much electricity does Plant A use on average?',
      a: 'How much electricity does Plant B use on average?',
  },
  judgment_stim: 'As a reminder, the power grid of Williamsburg is able to supply up to ' + unit(threshold, 'volt') + ' of electricity at any given time.' +
  ' So, if Plants A and B together use over ' + unit(threshold, 'volt') + ' of  electricity, there will not be enough power to supply the town, and the power grid will temporarily shut down.' +
  ' Today, Plant A used ' + unit(c, 'volt') + ' of electricity, and Plant B used ' + unit(a, 'volt') + ' of electricity. So, the power grid shut down. <br><br/> To what ' +
  ' extent do you agree with the following statement? <br><br/> Plant A using ' + unit(c, 'volt') + ' of electricity caused the town to lose power.'
},{
    name: 'water tank',
    instructions: 'Alison and Tony live together in a cabin outside of town. Their cabin has a water tank that automatically refills over the course of a day. The water tank holds '
    + unit(threshold, 'gallon') + ' when it is completely full. If more than ' + unit(threshold, 'gallon') + ' are used, then the water will no longer run in their cabin. '
    + 'So, if Alison and Tony together use more than ' + unit(threshold, 'gallon') + ' of water, the water will no longer run in their cabin. '
    + '<br><br>We will show you how much water Tony and Alison used on ' + n_learning +  ' separate days. For each day, you will be asked whether the cabin ran out of water.'
    + '<br><br><strong> Please try to pay attention to how much water each person uses on average. </strong>',
    units: 'gallon',
   learning:{
        stim1: 'Alison used ',
        stim2: ' of water.',
        stim3: ' Tony used ',
        stim4: ' of water.<p><strong> Did the cabin run out of water today?</strong></p>', 
        alert: 'Incorrect response, please try again. \n\nRemember that the tank will run out of water whenever the total amount of water used exceeds ' + threshold + ' gallons per day.',
    },
    man_check:{
        c: 'How much water does Alison use on average?',
        a: 'How much water does Tony use on average?',
    },
    judgment_stim: 'As a reminder, the water tank holds ' + unit(threshold, 'gallon') + ' of water when it is completely filled. So, if Alison and Tony use more than '
    + unit(threshold, 'gallon') + ' of water in a single day, the water will no longer run in their cabin. Today, Alison used ' + unit(c, 'gallon') + ' of water, '
    + ' and Tony used ' + unit(a, 'gallon') + ' of water. <br><br/> To what extent do you agree with the following statement? <br><br/> Alison using ' + unit(c, 'gallon') + ' of water caused the cabin to run out of water.'
  },
  /*{
    name: ,
    instructions: ,
    units: ,
    learning:{
        stim1: ,
        stim2: ,
        stim3: ,
        stim4: . 
        alert: ,
    },
    man_check:{
        c: ,
        a: ,
    },
    judgment_stim:
  }{
    name: ,
    instructions: ,
    units: ,
    learning:{
        stim1: ,
        stim2: ,
        stim3: ,
        stim4: . 
        alert: ,
    },
    man_check:{
        c: ,
        a: ,
    },
    judgment_stim:
  }{
    name: ,
    instructions: ,
    units: ,
    learning:{
        stim1: ,
        stim2: ,
        stim3: ,
        stim4: . 
        alert: ,
    },
    man_check:{
        c: ,
        a: ,
    },
    judgment_stim:
  }*/]

/* Randomly assign a condition */
var id = jsPsych.randomization.randomID();
var vignette = jsPsych.randomization.sampleWithoutReplacement(vignettes, 1)[0];
console.log('ID: ' + id);
console.log('Vignette: ' + vignette.name);


// Obtain a single version of each vignette randomly (use for within-participant design)
//var VIGNETTES = [...new Set(v.map(x => x.vignette))].map(x => jsPsych.randomization.sampleWithoutReplacement(v.filter(o => o.vignettte == x), 1)[0]);

// convert a number to a string in the correct units
function unit(n, unit='gallon') {
    if (n == 1)
        return n + ' ' + unit;
    return n + ' ' + unit + 's';
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
    pages: ["<p>In this study, you will be asked to read some scenarios and to answer questions about those scenarios.</p>",
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
                return vignette.learning.stim1 + unit(jsPsych.timelineVariable('c'), vignette.units) + vignette.learning.stim2 + vignette.learning.stim3 + unit(jsPsych.timelineVariable('a'), vignette.units) + vignette.learning.stim4;
            },
            data: {
                c: jsPsych.timelineVariable('c'),
                a: jsPsych.timelineVariable('a'),
                e: jsPsych.timelineVariable('e'),
            }
        }],
        loop_function: function (data) {
            let response = data.values()[0].response;
            let e = data.values()[0].e;
            if (response != e)
                alert(vignette.learning.alert);
            return response != e;
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
    stimulus: vignette.judgment_stim,
    min: 0, max: 1, step: 'any', require_movement: true,
    labels: ['not at all', 'totally'],
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
    stimulus: '<p>Please rate how confident you are in your choice.</p>',
    min: 0, max: 1, step: 'any', require_movement: true,
    labels: ['not at all', 'totally'],
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