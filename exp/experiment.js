var mu_c = 1;
var mu_a = 1;
var sd_c = 1;
var sd_a = 1;
var threshold = 3;
var n_learning = 10;

var learning_params = new Array(n_learning);
for (let i = 0; i<n_learning; i++) {
    let c = sampleNormal(mu_c, sd_c);
    let a = sampleNormal(mu_a, sd_a);
    let e = c+a > threshold;
    learning_params[i] = { trial: i+1, c: c, a: a, e: e }
}

// convert a number to a string in gallons
function gallons(g) {
    if (g == 1)
        return g + ' gallon';
    return g + ' gallons';
}

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
        "There are two plants, Plant A and Plant B, in the small town of Huxley. Every day, both plants send their sewage to the town's water treatment facility. The water facility is capable of filtering " + 
        gallons(threshold) + " of sewage per day. So, if Plant A and Plant B together produce more than " + gallons(threshold) + 
        " of sewage, then some pollution will leak out into the town’s river. <br><br>We will show you how much sewage each of the two plants produced on " + n_learning + 
        " separate days. For each day, you will be asked whether some pollution will leak out into the town’s river.<br><br><strong>Please try to pay attention to how much each plant produces on average.</strong>"]
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
                return '<p>Plant A sent ' + gallons(jsPsych.timelineVariable('c')) + ' of sewage to the water treatment plant.</p>' +
                    '<p>Plant B sent ' + gallons(jsPsych.timelineVariable('a')) + ' of sewage to the water treatment plant.</p>' +
                    '<p><strong>Did the water treatment plant leak sewage into the river today?</strong></p>';
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
                alert('Incorrect response, please try again.\n\nRemember that the treatment plant leaks sewage whenever the total amount of sewage exceeds ' + threshold + ' gallons.');
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
            { name: 'average_a', prompt: "How many gallons of sewage does Plant A produce on average?", required: true },
            { name: 'average_b', prompt: "How many gallons of sewage does Plant B produce on average?", required: true }],
        on_finish: function (data) {
            data.measure = 'manipulation_check';
            data.response_a = parseFloat(data.response.average_a);
            data.response_b = parseFloat(data.response.average_b);
        }
    }],
    loop_function: function (data) {
        let response_a = parseFloat(data.values()[0].response_a);
        if (isNaN(response_a)) alert("Please enter your response as a number.");
        if (!isNaN(response_a) & (response_a <= 0 || response_a > 150)) alert("Please enter a valid number of gallons.");
        let response_b = parseFloat(data.values()[0].response_b);
        if (isNaN(response_b)) alert("Please enter your response as a number.");
        if (!isNaN(response_b) & (response_b <= 0 || response_b > 150)) alert("Please enter a valid number of gallons.");
        return isNaN(response_a) || response_a <= 0 || response_a > 150 || isNaN(response_b) || response_b <= 0 || response_b > 150;
    }
}

/*display judgment */
var judgment = {
    type: jsPsychHtmlSliderResponse,
    stimulus: "<p>As a reminder, the water facility is capable of filtering " + gallons(threshold) + " of sewage per day. So, if Plant A and Plant B together produce more than " + gallons(threshold) + 
    " of sewage, then some pollution will leak out into the town’s river. On this day, Plant A sent c gallons of sewage to the water treatment plant, and Plant B sent a gallons" +
    " of sewage to the water treatment plant. <br> <br/> To what extent do you agree with the following statement? <br> <br/> The town’s water became polluted because Plant A produced c gallons of sewage. <p/>",
    min: 0, max: 1, step: 'any', require_movement: true,
    labels: ['Not Caused by Plant A at All', 'Definitely Caused by Plant A'],
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
    labels: ['Not Confident at All', 'Extremely Confident'],
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