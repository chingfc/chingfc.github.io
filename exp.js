const jsPsych = initJsPsych({
  auto_update_progress_bar: true,
  extensions: [{ type: Naodao }],
});

const main_timeline = [];

// randomize the order of the donation program
donation_program = jsPsych.randomization.shuffle(donation_program);


let modified_list = [];
let trial_index = 0
let onset_time = 0;

let sov_list;
let canvas, ctx;

let if_buy;
let repeat_donation_program = []
let repeat_flag = false;

let sumNumbers;
let correctAnswerIndex; // Index of the correct answer (0-based)

// to collect the gained money for each trial
let gained_money;
let calculation_money = 0
let multi_choice_money = 0

let remaining_money;

let program_name;
let donation_scale_list = jsPsych.randomization.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
let deposit_scale_list = jsPsych.randomization.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
let selected_option;

let slider_value;

const xStart = 100; // Starting x position
const yTopRect = 120; // y position of top rectangles
const rectWidth = 60, rectHeight = 45; // Dimensions for rectangles
const circleRadius = 15; // Radius for circles
const spacing = 120; // Space between each node set
const circleDistance = 30; // Distance between the circle and rectangles
const circles = []; // To store circle positions

// Global colors for default and clicked states
const defaultRectColor = "#4682B4";
const defaultCircleColor = "#1592E6";
const defaultLineColor = "#4682B4";
const clickedRectColor = "#ff6347";
const clickedCircleColor = "#ff6347";
const clickedLineColor = "#ff6347";

// Track the clicked index to change the color
let clickedNodeIndex = -1;
let hoveredNodeIndex = -1;

let fullscreen = {
  type: jsPsychFullscreen,
  message: FULLSCREEN,
  button_label: ["开 始"],
};

main_timeline.push(fullscreen)

const info = {
  type: jsPsychSurveyHtmlForm,
  html: INFO,
  button_label: "继续",
};


main_timeline.push(info);


const sov_instruction = {
  type: jsPsychHtmlButtonResponse,
  stimulus: () => {
    return `
    <div class="form-container">
    <p>首先，您需要把钱分给您自己和另一位随机选择的参与者。为了保证匿名性，您不会知道对方是谁，对方也不会知道您是谁。您的所有决定都将严格保密。您的决定将同时决定您和对方最后的奖金数额。也就是说，你的决定不仅会影响你收到的钱，还会影响对方收到的钱。您将经历<h>总共六轮游戏</h>，在这六轮游戏中，您必须将所给的钱在自己和对方之间进行分配。每轮只能选择一个选项。请尽量按照<b>你本身的意愿</b>告诉我们您会如何分配这笔钱。答案没有对错之分。这完全取决于您的个人偏好。</p>
    <p>例如：在下面的例子中，这个人选择了自己得到93个单位的钱，另一个人将得到33个单位的钱。请注意，这个人的选择将决定另一个人的奖金数额。</p>
    <img src="dist/asset/img/sov_example.png" alt="sov_example" width=1211 height=409 style='margin: 0 auto; max-width=750px; height: auto'>
    </div>
    `
  },
  choices: ['继 续'],
}

const SOV_procedure = {
  type: jsPsychHtmlButtonResponse,
  stimulus: '<canvas id="diagram" width="1200" height="400"></canvas>',
  choices: ['确定'],
  data: {
    task_type: 'SOV'
  },
  on_load: () => {
    // get the btn
    let btn = document.querySelector('.jspsych-btn');
    btn.disabled = true;

    canvas = document.getElementById('diagram');
    ctx = canvas.getContext('2d');

    // Diagram data
    sov_list = SOV_DATA[trial_index]
    // Add event listeners directly to the canvas
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('mousemove', handleMouseMove);
    // Initial draw
    drawDiagram();
    },
  on_finish: (data) => {
    data.sov_items = sov_list[clickedNodeIndex]
    data.response = clickedNodeIndex + 1;
    trial_index ++;
    clickedNodeIndex = -1
  }

}

const SOV_timeline = {
  timeline: [
    SOV_procedure,
  ],
  repetitions: 6,
}



main_timeline.push(sov_instruction, SOV_timeline)

/*
接下来进行实验的第一部分，在这一部分开始之前，你需要通过回答一些计算题和知识问答题来赚取第一部分实验中可以支配的金额，一共20道题，其中10道计算题，每道题2块钱；10道知识问答，每道题3块钱。每道题答错即不给钱。请按空格键开始答题。
*/

const reset_variables = {
  type: jsPsychCallFunction,
  func: () => {
    trial_index = 0;
    clickedNodeIndex = -1;
    hoveredNodeIndex = -1;
  }


}
const sumNumber_instruction = {
  type: jsPsychHtmlButtonResponse,
  stimulus: () => {
    return `
    <div class="form-container">
    <p>接下来进行实验的第一部分，在这一部分开始之前，你需要通过回答一些计算题和知识问答题来赚取第一部分实验中可以支配的金额，一共20道题，其中10道计算题，每道题2块钱；10道知识问答，每道题3块钱。每道题答错即不给钱。请点击【确定】按钮开始答题。</p>
    </div>
    `
  },
  choices: ['确定'],
}


const sumNumber_procedure = {
  timeline: [{
  type: jsPsychHtmlKeyboardResponse,
  stimulus: () => {

    let html = '<p>请在下方输入您看到的数字之和。</p>';
    html += '<div id="number-container">';
     // pick 6 random numbers from 1 to 9
    sumNumbers  = Array.from({ length: 6 }, () => Math.floor(Math.random() * 9) + 1);

    // display numbers
    sumNumbers.forEach((number, index) => {
      if (index === 5) {
        html += `<div class="number-box">${number}</div> = ?`;
      } else {
      html += `<div class="number-box">${number}</div>+`;
      }
    });
    html += '</div>';

    // Form for user input
    html += '<div id="answer-form">';
    html += '<label for="sum-input">请输入您的答案：</label>';
    html += '<input type="number" id="sum-input" />';
    html += '<input class="jspsych-btn" type="submit" value="提 交" onclick="checkSum()" />'
    html += '</div>';

    // areas for feedback
    html += '<div id="feedback"></div>';

    onset_time = performance.now();

    return html;
  },
  choices: 'NO_KEYS',
  data: {
    task_type: 'sumNumber'
  },
  }], 
  repetitions: 10,
}

const sumNumber_timeline = {
  timeline: [
    sumNumber_procedure,
    {
      type: jsPsychHtmlButtonResponse,
      stimulus: () => {
        let html = '<div class="form-container">';
        html += '<h3>在数学运算实验中</h3>';
        html += '<p>您共答对' + parseInt(calculation_money/2) + '道题。</p>';
        html += '<p您的总收益为' + calculation_money + '元。</p>';
        html += '<p>接下来，您将进入知识问答环节。</p>';
        html += '</div>';
        return html;
      },
      choices: ['继 续'],
    }
  ],
}

main_timeline.push(reset_variables, sumNumber_instruction, sumNumber_timeline)

// Configure jsPsych with the question stimulus
const multi_choice_procedure = {
  timeline: [{
    type: jsPsychCanvasKeyboardResponse,
    stimulus: drawQuestion,
    canvas_size: [450, 900],
    prompt: '<button id="submitButton" class="jspsych-btn">确定</button>',
    choices: 'NO_KEYS',
    data: {
      task_type: 'multi_choice'
    },
    on_load: () => {
      // Add a click event to the submit button
      document.getElementById('submitButton').addEventListener('click', checkAnswer);
    }
    }
  ],
  repetitions: 10,
}

const multi_choice_timeline = {
  timeline: [
    multi_choice_procedure,
    {
      type: jsPsychHtmlButtonResponse,
      stimulus: () => {
        gained_money = calculation_money + multi_choice_money;
        let html = '<p>答题结束，恭喜你挑战成功！</p>';
        html += `<p>在答题环节，你总共答对了（${calculation_money / 2}）道计算题，（${multi_choice_money / 3}）道知识问答，总共获得了（${gained_money}）元作为你接下来实验的可支配金额。</p>`;
        onset_time = performance.now();
        return html;
      },
      data: {
        task_type: 'money_summary'
      },
      choices: ['继 续'],  
      on_finish: (data) => {
        data.rt = performance.now() - onset_time;
        data.response = {
          'calculation': calculation_money,
          'multi_choice': multi_choice_money,
          'total': calculation_money + multi_choice_money
        }
      }
    },
  ],  
}


main_timeline.push(reset_variables, multi_choice_timeline)


const donation_tutorial = {
  timeline: [{
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
      return `
        <div class="form-container">
          <p>我们需要你一起为中华慈善总会中的一些慈善项目进行捐款，在下面的环节中，我们要为这些项目之一即“为了明天，关爱儿童”项目进行捐款，这个项目的宣传语是：“我们致力于照亮贫困地区孩子的未来，通过教育赋予他们改变命运的力量。您的支持可以帮助我们在这些社区建立学校、提供必要的教育资源，并为他们开启通往知识和自我提升的大门。”</p>
          <p>此环节<h>分为三轮</h>，每一轮都会询问你是否需要购买这个慈善项目的额外信息，并进行相应的捐赠选择。<h>每一轮之间相互独立，即每一轮中你可以支配的金额 = 刚刚赚取的金额</h>，我们会随机选择一轮的结果作为第一部分的真实结果。如果你已经了解，请按空格键进行确认。</p>
        </div>
      `},
    choices: ['继续'],
  },
  ]
  }

const donation_procedure = {
  timeline: [
    {
      timeline: [{ 
          type: jsPsychHtmlButtonResponse,
          stimulus: () => {
            return `
            <div class="money-remaining">剩余金额：<span id="remainingMoney">${gained_money}</span> 元</div>
            <div class="form-container">
            <div class="question-container"></div>
            </div>
            `},
          choices: ['愿意购买', '不愿意购买'],
          data: {
            task_type: 'buy_info'
          },
          on_load: () => {
            let trial_data = donation_program[trial_index];
            document.querySelector('.question-container').innerHTML = trial_data.prompt;
          },
          on_finish: (data) => {
            let response = data.response;
            if_buy = !response;
            console.log('if buy', if_buy)
            remaining_money = if_buy ? gained_money - 5 : gained_money;

            if (!if_buy) {
              // add the current donation program to the repeat_donation_program
              repeat_donation_program.push(donation_program[trial_index]);
            }
          }
        },
        donation_main(),
      ],
        repetitions: 3,
    },
    {
      type: jsPsychCallFunction,
      func: () => {
        repeat_flag = true;
        trial_index = 0
      }
    },
    {
      timeline: [
        {
        timeline: [donation_main()],
        loop_function: () => {
          return trial_index < repeat_donation_program.length; 
        }
      }],
      conditional_function: () => {return repeat_donation_program.length}
  }]
}

main_timeline.push(reset_variables, donation_procedure)

// part 2
const part2_tutorial = {
  timeline: [{
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
      return `<div class="form-container">你已经完成了第一部分的实验，可以稍作休息，开始第二部分的实验，休息好了请点击【继续】按钮继续实验。
      </div>`},
    choices: ['继续'],
  },
    ]
}

part2_donation = {
    type: jsPsychCanvasKeyboardResponse,
    stimulus: (c) =>{
      const ctx = c.getContext('2d');
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.font = '20px "Microsoft YaHei"';

      const question = '首先，请从下面的慈善项目中选择你最喜欢的项目（即如果让你给下面项目中的一个捐款，你会选择哪一个？），点击对应的项目：';

      const options = ['慈善情暖万家', '为了明天 关爱儿童', '平民英雄守护', '中华慈善总会志心助农'];

      // Draw the question centered at the top
      const questionX = 100; // Adjust this as needed for your design
      const startY = 150; // Adjust for the question's vertical position
      drawWrappedChineseText(ctx, question, questionX, startY, 600, 24);
      // ctx.fillText(question, questionX, startY);

      const optionX = questionX; // Keep the options aligned with the question
      const optionYStart = startY + 90;
      const optionHeight = 30;
      const padding = 10;
      const clickableRegions = [];

      // Function to draw all options
      function drawOptions() {
        // Clear the region below the question
        ctx.clearRect(0, startY + 60, c.width, c.height - 120);

        options.forEach((option, index) => {
          // Determine the Y position for each option
          const optionY = optionYStart + index * (optionHeight + padding);

          // Change font size if hovered
          if (hoveredNodeIndex === index) {
            ctx.font = '22px "Microsoft YaHei"';
          } else {
            ctx.font = '20px "Microsoft YaHei"';
          }

          const textWidth = ctx.measureText(option).width;

          // Create the clickable region with appropriate padding
          const region = {
            option,
            x: optionX,
            y: optionY - optionHeight / 2,
            width: textWidth + padding * 2,
            height: optionHeight
          };

          // Set color based on whether it's selected
          if (index === clickedNodeIndex) {
            ctx.fillStyle = 'blue';
            ctx.font = '600 20px "Microsoft YaHei"'; // Bold font
          } else {
            ctx.fillStyle = 'black'; // Default text color
          }

          // Draw the option text
          ctx.fillText(option, optionX, optionY);
          clickableRegions[index] = region; // Store the clickable region
        });
      }

      // Add a mouse move event to detect hovering
      c.addEventListener('mousemove', function handleMouseMove(e) {
        const rect = c.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) * (c.width / rect.width);
        const mouseY = (e.clientY - rect.top) * (c.height / rect.height);

        hoveredNodeIndex = null; // Reset the hovered state

        clickableRegions.forEach((region, index) => {
          if (
            mouseX >= region.x &&
            mouseX <= region.x + region.width &&
            mouseY >= region.y &&
            mouseY <= region.y + region.height
          ) {
            hoveredNodeIndex = index; // Set the hovered index
          }
        });

        drawOptions(); // Redraw the options with hover effect
      });

      // Add a click event to select an option
      c.addEventListener('click', function handleClick(e) {
        const rect = c.getBoundingClientRect();
        const clickX = (e.clientX - rect.left) * (c.width / rect.width);
        const clickY = (e.clientY - rect.top) * (c.height / rect.height);

        clickableRegions.forEach((region, index) => {
          if (
            clickX >= region.x &&
            clickX <= region.x + region.width &&
            clickY >= region.y &&
            clickY <= region.y + region.height
          ) {
            clickedNodeIndex = index; // Mark this index as selected
          }
        });

        drawOptions(); // Redraw options with selection effect
      });

      // Initial drawing of the options
      drawOptions();
    },
    prompt: '<button id="submitButton" class="jspsych-btn">确定</button>',
    on_load: () => {
      // button is clicked
      let btn = document.querySelector('#submitButton');

      btn.addEventListener('click', function(){

        const canvas  = document.querySelector('canvas');
        const ctx = canvas.getContext('2d');

        const options = ['慈善情暖万家', '为了明天 关爱儿童', '平民英雄守护', '中华慈善总会志心助农']
        const selected_option = options[clickedNodeIndex];

        console.log('selected_option', selected_option)
        
        // to check if the selected option is clicked
        if (!selected_option) {
          ctx.fillStyle = 'red';
          ctx.fillText('请选择一个慈善项目!', 400, 300);
        } else {
          
          btn.disabled = true;

          program_name = selected_option;
          ctx.fillStyle = 'red';
          ctx.fillText('你选择的慈善项目为：'+ selected_option, 400, 300);
          jsPsych.pluginAPI.setTimeout(() => {
          jsPsych.finishTrial({
            stimulus: '首先，请从下面的慈善项目中选择你最喜欢的项目（即如果让你给下面项目中的一个捐款，你会选择哪一个？），点击对应的项目：',
            response: selected_option,
          });
        }, 1000);
      }
      });
    },
    data: {
      task_type: 'favorite-project-part2'
    },
    canvas_size: [400, 900],
    choices: 'NO_KEYS',
    },
    {
      type: jsPsychHtmlButtonResponse,
      stimulus: () => {
        return `
        <div class="form-container">在本部分中，除了您将因参与实验而获得20元之外，我们还为您提供<h>额外30元</h>。您可以选择<b>将这30元留给自己加在最后的实验报酬中</b>，也可以将<b>部分或全部捐赠给您所选择的慈善机构</b>。我们会<b>随机选择</b>您的一个实验决策作为最终的结果，请点击【继续】确认。
        </div>
        `
      },
      choices:  ['继续'],
}

const part2_deposit = {

  type: jsPsychHtmlButtonResponse,
  stimulus: () => {
    return `
    <div class="form-container">在本部分中，除了您将因参与实验而获得20元之外，我们还为您提供<h>额外30元</h>。您可以选择<b>将这30元直接留给自己加在最后的实验报酬中</b>，也可以将<b>将部分或全部储蓄到我们的项目中，等待一个月后收到储蓄部分的本金和利润</b>。我们会<b>随机选择</b>您的一个实验决策作为最终的结果，请点击【继续】确认。
    </div>
    `
  },
  choices:  ['继续'],
}


main_timeline.push({
  type: jsPsychCallFunction,
  func: () => {
    remaining_money = 30;
  },
  reset_variables,
})


const donation_task_procedure = {
  timeline: [
    {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: () => {
      return `
      <div class="money-remaining">
        剩余金额：<span id="remainingMoney">${remaining_money}</span> 元
    </div>
      <div class="form-container">
        <div class="question-container"></div>
        <div class="option-container">
          请输入想要捐赠的金额：<input type="number" id="donationAmount" class="donation-input" placeholder="请输入金额">元</div>
        </div>
        <button id="submitButton" class="jspsych-btn">提交</button>
        <p id="feedbackMessage"></p>
    </div>
      `
    },
    choices: 'NO_KEYS',
    on_load: () => {

      onset_time = performance.now();

      let program_money = donation_scale_list[trial_index];
      let instr = `接下来，你要为“${program_name}”项目进行捐款。在这个项目中，您每捐出1元钱，我们就会捐出<h>${program_money}元</h>，这样“${program_name}”项目就能收到您捐出的<h>${program_money+1}倍</h>的钱。那么，您想向“${program_name}”项目捐赠 30元中的多少？（最高捐赠金额为30。请记住，您每捐出1元钱，我们就会捐出<h>${program_money}元</h>钱，使金额翻<h>${program_money+1}倍</h>。）
      `
      document.querySelector('.question-container').innerHTML = instr;
      const donationInput = document.getElementById('donationAmount');
      const feedbackMessage = document.getElementById('feedbackMessage');
      const submitButton = document.getElementById('submitButton');


      // Handle the form submission
      submitButton.addEventListener('click', function () {
        const donationAmount = donationInput.value;
        if (donationAmount && !isNaN(donationAmount) && (donationAmount >= 0) && (donationAmount <= remaining_money)) { // to check if the input is less than the remaining money
            feedbackMessage.textContent = `您选择捐赠 ${donationAmount} 元。`;
            feedbackMessage.style.color = 'green';

            remaining_money -= donationAmount;

            document.getElementById('remainingMoney').textContent = remaining_money;

            submitButton.disabled = true;
            let save_info = {
              response: donationAmount,
              task_type: 'donation_task',
              stimulus: program_money,
              rt: performance.now() - onset_time
            };
            jsPsych.pluginAPI.setTimeout(() => {
              trial_index ++;
              remaining_money = 30;
              jsPsych.finishTrial(save_info);
          }, 1000);
        } else {
            feedbackMessage.textContent = '请输入有效的捐赠金额。';
            feedbackMessage.style.color = 'red';
        }
    } 
  );
    },
    }],
    repetitions: 10,
}


const deposit_task_procedure = {
  timeline: [
    {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: () => {
      return `
      <div class="money-remaining">
        剩余金额：<span id="remainingMoney">${remaining_money}</span> 元
    </div>
      <div class="form-container">
        <div class="question-container"></div>
        <div class="option-container">
          请输入想要储蓄的金额：<input type="number" id="donationAmount" class="donation-input" placeholder="请输入金额">元</div>
        </div>
        <button id="submitButton" class="jspsych-btn">提交</button>
        <p id="feedbackMessage"></p>
    </div>
      `
    },
    choices: 'NO_KEYS',
    on_load: () => {

      onset_time = performance.now();

      let program_money = deposit_scale_list[trial_index];
      let instr = `接下来，你要为你自己进行储蓄。在本次储蓄中，您每储蓄1元钱，我们就会给出<h>${program_money}元</h>的利息，这样一个月之后就你就能收到您储蓄部分的<h>${program_money+1}倍</h>的钱。那么，您想为一个月后的自己储蓄30元中的多少？（最高储蓄金额为30。请记住，您每储蓄1元钱，我们就会捐出<h>${program_money}元</h>钱，使金额翻<h>${program_money+1}倍</h>。）
      `
      document.querySelector('.question-container').innerHTML = instr;
      const donationInput = document.getElementById('donationAmount');
      const feedbackMessage = document.getElementById('feedbackMessage');
      const submitButton = document.getElementById('submitButton');


      // Handle the form submission
      submitButton.addEventListener('click', function () {
        const donationAmount = donationInput.value;
        if (donationAmount && !isNaN(donationAmount) && (donationAmount >= 0) && (donationAmount <= remaining_money)) { // to check if the input is less than the remaining money
            feedbackMessage.textContent = `您选择储蓄 ${donationAmount} 元。`;
            feedbackMessage.style.color = 'green';

            remaining_money -= donationAmount;

            document.getElementById('remainingMoney').textContent = remaining_money;

            submitButton.disabled = true;
            let save_info = {
              response: donationAmount,
              task_type: 'deposit_task',
              stimulus: program_money,
              rt: performance.now() - onset_time
            };
            jsPsych.pluginAPI.setTimeout(() => {
              trial_index ++;
              remaining_money = 30;
              jsPsych.finishTrial(save_info);
          }, 1000);
        } else {
            feedbackMessage.textContent = '请输入有效的储蓄金额。';
            feedbackMessage.style.color = 'red';
        }
    } 
  );
    },
    }],
    repetitions: 10,
}



// deposit-donation task
main_timeline.push(
  part2_tutorial,
  part2_deposit,
  reset_variables,
  {
    type: jsPsychCallFunction,
    func: () => {
      remaining_money = 30;
    }
  },
  deposit_task_procedure,
  reset_variables,
  {
    type: jsPsychCallFunction,
    func: () => {
      remaining_money = 30;
    }
  },
  part2_donation,
  reset_variables,
  donation_task_procedure,
)

// part 3
const part3_tutorial = {
  timeline: [{
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
      return `<div class="form-container">你已经完成了第二部分的实验，可以稍作休息，开始第三部分的实验，休息好了请按【继续】按钮开始。
      </div>`},
    choices: ['继续'],
  },
    ]
}

const part3_donation = {
  timeline: [
    {
      type: jsPsychCanvasKeyboardResponse,
      stimulus: (c) =>{
        const ctx = c.getContext('2d');
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.font = '20px "Microsoft YaHei"';
  
        const question = '首先，和第二部分一样，请从下面的慈善项目中选择你最喜欢的项目（即如果让你给下面项目中的一个捐款，你会选择哪一个？），点击对应的项目：';
  
        const options = ['爱小丫女生加油计划', '让儿童免于被性侵', '帮宝贝战胜先天病', '给孤儿妈妈般的爱'];
  
        // Draw the question centered at the top
        const questionX = 100; // Adjust this as needed for your design
        const startY = 150; // Adjust for the question's vertical position
        drawWrappedChineseText(ctx, question, questionX, startY, 600, 24);
        // ctx.fillText(question, questionX, startY);
  
        const optionX = questionX; // Keep the options aligned with the question
        const optionYStart = startY + 100;
        const optionHeight = 30;
        const padding = 10;
        const clickableRegions = [];
  
        // Function to draw all options
        function drawOptions() {
          // Clear the region below the question
          ctx.clearRect(0, startY + 60, c.width, c.height - 120);
  
          options.forEach((option, index) => {
            // Determine the Y position for each option
            const optionY = optionYStart + index * (optionHeight + padding);
  
            // Change font size if hovered
            if (hoveredNodeIndex === index) {
              ctx.font = '22px "Microsoft YaHei"';
            } else {
              ctx.font = '20px "Microsoft YaHei"';
            }
  
            const textWidth = ctx.measureText(option).width;
  
            // Create the clickable region with appropriate padding
            const region = {
              option,
              x: optionX,
              y: optionY - optionHeight / 2,
              width: textWidth + padding * 2,
              height: optionHeight
            };
  
            // Set color based on whether it's selected
            if (index === clickedNodeIndex) {
              ctx.fillStyle = 'blue';
              ctx.font = '600 20px "Microsoft YaHei"'; // Bold font
            } else {
              ctx.fillStyle = 'black'; // Default text color
            }
  
            // Draw the option text
            ctx.fillText(option, optionX, optionY);
            clickableRegions[index] = region; // Store the clickable region
          });
        }
  
        // Add a mouse move event to detect hovering
        c.addEventListener('mousemove', function handleMouseMove(e) {
          const rect = c.getBoundingClientRect();
          const mouseX = (e.clientX - rect.left) * (c.width / rect.width);
          const mouseY = (e.clientY - rect.top) * (c.height / rect.height);
  
          hoveredNodeIndex = null; // Reset the hovered state
  
          clickableRegions.forEach((region, index) => {
            if (
              mouseX >= region.x &&
              mouseX <= region.x + region.width &&
              mouseY >= region.y &&
              mouseY <= region.y + region.height
            ) {
              hoveredNodeIndex = index; // Set the hovered index
            }
          });
  
          drawOptions(); // Redraw the options with hover effect
        });
  
        // Add a click event to select an option
        c.addEventListener('click', function handleClick(e) {
          const rect = c.getBoundingClientRect();
          const clickX = (e.clientX - rect.left) * (c.width / rect.width);
          const clickY = (e.clientY - rect.top) * (c.height / rect.height);
  
          clickableRegions.forEach((region, index) => {
            if (
              clickX >= region.x &&
              clickX <= region.x + region.width &&
              clickY >= region.y &&
              clickY <= region.y + region.height
            ) {
              clickedNodeIndex = index; // Mark this index as selected
            }
          });
  
          drawOptions(); // Redraw options with selection effect
        });
  
        // Initial drawing of the options
        drawOptions();
      },
      prompt: '<button id="submitButton" class="jspsych-btn">确定</button>',
      on_load: () => {
        // button is clicked
        let btn = document.querySelector('#submitButton');
  
        btn.addEventListener('click', function(){
  
          const canvas  = document.querySelector('canvas');
          const ctx = canvas.getContext('2d');
  
          const options = ['爱小丫女生加油计划', '让儿童免于被性侵', '帮宝贝战胜先天病', '给孤儿妈妈般的爱'];
          const selected_option = options[clickedNodeIndex];
  
          console.log('selected_option', selected_option)
          
          // to check if the selected option is clicked
          if (!selected_option) {
            ctx.fillStyle = 'red';
            ctx.fillText('请选择一个慈善项目!', 400, 300);
          } else {
            
            btn.disabled = true;
  
            program_name = selected_option;
            ctx.fillStyle = 'red';
            ctx.fillText('你选择的慈善项目为：'+ selected_option, 400, 300);
            jsPsych.pluginAPI.setTimeout(() => {
            jsPsych.finishTrial({
              stimulus: '首先，和第二部分一样，请从下面的慈善项目中选择你最喜欢的项目（即如果让你给下面项目中的一个捐款，你会选择哪一个？），点击对应的项目：',
              response: selected_option,
            });
          }, 1000);
        }
        });
      },
      data: {
        task_type: 'favorite-project-part3'
      },
      canvas_size: [400, 900],
      choices: 'NO_KEYS',
      },
      {
        type: jsPsychHtmlButtonResponse,
        stimulus: () => {
          return `
          <div class="form-container">
          <p>在这一部分中，首先会呈现一个捐赠情境，在捐赠情境之后会呈现一些捐赠安排，<h>每一次捐赠安排独立呈现</h>，在每一次捐赠安排呈现之后，你需要选择是否接受这个捐赠安排，并选择你接受的意愿。</p>
          <p>请注意，在这一部分，我们也会随机选择一个决策作为本部分的结果。最终的结果是<b>随机选择</b>三个实验部分所选出的三个结果中的其中之一进行执行。请点击【继 续】按钮继续实验。</p>
          </div>
          `
        },
        choices:  ['继续'],
      },
      {
        type: jsPsychHtmlButtonResponse,
        stimulus: () => {
          return `
          <div class="form-container"><p>接下来，我们要为慈善项目进行捐款，献出自己的一份爱心，项目名称是“${program_name}”。</p>
          <p>${checkSituation()}</p>
          </div>
          `
        },
        choices: ['继续'],
      },
      {
        type: jsPsychHtmlButtonResponse,
        stimulus: () => {
          return `
          <div class="form-container">
          <p>在随后的每一次捐赠选择中，我们会呈现<h>你的捐赠（用饼状图中红色的部分进行表示）</h>以及对应的<span style="color:green">实验者捐款（也就是我们项目组要捐赠的金额，用饼状图中绿色的部分进行表示）</span>，这两部分的和（整个饼状图）就是在这次捐赠中的总金额，你需要在每一次呈现完饼状图之后选择<b>是否进行这样的安排</b>，选择接受或者不接受（点击对应的按钮）。以及你在本次捐赠中的捐赠意愿是多少（拖动滑块）</p>
   
          </div>
          `
        },
        choices: ['继续'],
      },
  ]
}

const part3_deposit = {
  timeline: [
    {
      type: jsPsychHtmlButtonResponse,
      stimulus: () => {
        return `
        <div class="form-container"><p>接下来，我们要为自己进行储蓄”。</p>
        </div>
        `
      },
      choices: ['继续'],
    },
    {
      type: jsPsychHtmlButtonResponse,
      stimulus: () => {
        return `
        <div class="form-container">
        <p>在每一次储蓄选择中，我们会呈现<h>你的储蓄（用饼状图中红色的部分进行表示）</h>以及对应的<span style="color:green">实验者给您的利息（用饼状图中绿色的部分进行表示）</span>，这两部分的和（整个饼状图）就是您在这次储蓄中的获得的总金额，你需要在每一次呈现完饼状图之后选择<b>是否进行这样的安排</b>，选择接受或者不接受（点击对应的按钮）。以及你在本次储蓄中的储蓄意愿是多少（拖动滑块）。</p>
 
        </div>
        `
      },
      choices: ['继续'],
    },


  ]
}

const chart_deposit_procedure1 = {
  timeline: [
    {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: () => {
        return `
        <div class="form-container">
        <h3>本次的储蓄是：</h3>
        <div class="donation-container">
            <canvas id="donationCanvas" width="500" height="240"></canvas>
        </div>

        <div class="choice-container">
        <p>你的储蓄选择是：</p>
        <button id="yes-button" class="jspsych-btn">储 蓄</button>
        <button id="no-button" class="jspsych-btn">不储蓄</button>
    </div>
        <p id="feedbackMessage"></p>
        </div>
        `},
      choices: 'NO_KEYS',
      data: {
        task_type: 'deposit+' + jsPsych.timelineVariable('taskType'),
      },
      on_load: () => {
        const redAmount = jsPsych.timelineVariable('yours');
        const greenAmount = jsPsych.timelineVariable('program');
        const totalAmount = redAmount + greenAmount;

        // Calculate angles for each sector
        const redAngle = (2 * Math.PI * redAmount) / totalAmount;

        // Drawing parameters
        const cx = 200, cy = 100; // Center of the circle
        const radius = 100; // Radius of the circle


        // Legend position inside the canvas
        const legendX = 350;
        const legendY = 80;
        const legendItemHeight = 20;
        const legendSpacing = 10;

        // Get the canvas and context
        const canvas = document.getElementById('donationCanvas');
        const ctx = canvas.getContext('2d');

        // Draw the red segment
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + redAngle, false);
        ctx.closePath();
        ctx.fillStyle = 'red';
        ctx.fill();

        // Draw the green segment
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, -Math.PI / 2 + redAngle, -Math.PI / 2 + 2 * Math.PI, false);
        ctx.closePath();
        ctx.fillStyle = 'green';
        ctx.fill();

        // Function to draw text inside a segment
        function drawTextInSegment(text, angleStart, angleEnd, color) {
            const middleAngle = (angleStart + angleEnd) / 2;
            const xText = cx + (radius / 2) * Math.cos(middleAngle);
            const yText = cy + (radius / 2) * Math.sin(middleAngle);

            ctx.fillStyle = color;
            ctx.font = '16px Microsoft YaHei';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, xText, yText);
        }

         // Disable both buttons after either is clicked
         function disableButtons() {
          document.getElementById('yes-button').disabled = true;
          document.getElementById('no-button').disabled = true;
      }

        // Draw text inside the segments
        drawTextInSegment(`¥${redAmount}`, -Math.PI / 2, -Math.PI / 2 + redAngle, 'white');
        drawTextInSegment(`¥${greenAmount}`, -Math.PI / 2 + redAngle, -Math.PI / 2 + 2 * Math.PI, 'white');

        // Draw the legend inside the canvas
        function drawLegend() {
          // Draw the "Project Donation" legend
          ctx.fillStyle = 'green';
          ctx.fillRect(legendX, legendY, 20, legendItemHeight);
          ctx.fillStyle = 'black';
          ctx.font = '14px Microsoft YaHei';
          ctx.textBaseline = 'middle';
          ctx.fillText('项目组利息', legendX + 60, legendY + legendItemHeight / 2);

          // Draw the "Your Donation" legend
          ctx.fillStyle = 'red';
          ctx.fillRect(legendX, legendY + legendItemHeight + legendSpacing, 20, legendItemHeight);
          ctx.fillStyle = 'black';
          ctx.fillText('你的储蓄', legendX + 60, legendY + legendItemHeight + legendSpacing + legendItemHeight / 2);
      }

        // Draw the legend
        drawLegend();

        // Event handlers for the choices (Yes/No)
        document.getElementById('yes-button').addEventListener('click', function() {
            disableButtons();
            document.getElementById('feedbackMessage').textContent = '您选择储蓄。';
            jsPsych.pluginAPI.setTimeout(() => {
              jsPsych.finishTrial({
                response: 1,
                yours: redAmount,
                program: greenAmount,
              });
        }, 1000);
        });

        document.getElementById('no-button').addEventListener('click', function() {
          disableButtons();
          document.getElementById('feedbackMessage').textContent = '您选择不储蓄。';
          jsPsych.pluginAPI.setTimeout(() => {
            jsPsych.finishTrial({
              response: 0,
              yours: redAmount,
              program: greenAmount,
            });
        }, 1000);
      }
    );
    }
    },
    {
      type: jsPsychHtmlButtonResponse,
      stimulus: () => {
        return `
        <h3>本次储蓄的意愿是多少？</h3>
        <div class="slider-container">
            <label for="slider" class="label">1（比较小的意愿）到5（很强烈的意愿）</label>
            <input type="range" id="slider" min="1" max="5" value="1" step="1">
            <div class="range-labels">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
            </div>
        </div>
        `
      },
      choices: ['继 续'],
      on_load: () => {
        const slider = document.getElementById('slider');
        // const sliderValue = document.getElementById('sliderValue');

        slider.addEventListener('input', () => {
            // sliderValue.textContent = slider.value;
            slider.style.background = `linear-gradient(to right, #4caf50 ${((slider.value - 1) / 4) * 100}%, #d3d3d3 ${((slider.value - 1) / 4) * 100}%)`
        });
        // get the slider value
        document.querySelector('.jspsych-btn').addEventListener('click', () => {
            slider_value = slider.value;
        });
    },
    data: {
      task_type: 'deposit-slider'
    },
    on_finish: (data) => {
      data.response = slider_value;
      data.yours = jsPsych.timelineVariable('yours');
      data.program = jsPsych.timelineVariable('program');
    }
  }
  ],
  timeline_variables: donation_part3_data1,
  randomize_order: true,
}

const chart_deposit_procedure2 = {
  timeline: [
    {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: () => {
        return `
        <div class="form-container">
        <h3>本次的储蓄是：</h3>
        <div class="donation-container">
            <canvas id="donationCanvas" width="500" height="240"></canvas>
        </div>

        <div class="choice-container">
        <p>你的储蓄选择是：</p>
        <button id="yes-button" class="jspsych-btn">储 蓄</button>
        <button id="no-button" class="jspsych-btn">不储蓄</button>
    </div>
        <p id="feedbackMessage"></p>
        </div>
        `},
      choices: 'NO_KEYS',
      data: {
        task_type: 'deposit+' + jsPsych.timelineVariable('taskType'),
      },
      on_load: () => {
        const redAmount = jsPsych.timelineVariable('yours');
        const greenAmount = jsPsych.timelineVariable('program');
        const totalAmount = redAmount + greenAmount;

        // Calculate angles for each sector
        const redAngle = (2 * Math.PI * redAmount) / totalAmount;

        // Drawing parameters
        const cx = 200, cy = 100; // Center of the circle
        const radius = 100; // Radius of the circle


        // Legend position inside the canvas
        const legendX = 350;
        const legendY = 80;
        const legendItemHeight = 20;
        const legendSpacing = 10;

        // Get the canvas and context
        const canvas = document.getElementById('donationCanvas');
        const ctx = canvas.getContext('2d');

        // Draw the red segment
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + redAngle, false);
        ctx.closePath();
        ctx.fillStyle = 'red';
        ctx.fill();

        // Draw the green segment
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, -Math.PI / 2 + redAngle, -Math.PI / 2 + 2 * Math.PI, false);
        ctx.closePath();
        ctx.fillStyle = 'green';
        ctx.fill();

        // Function to draw text inside a segment
        function drawTextInSegment(text, angleStart, angleEnd, color) {
            const middleAngle = (angleStart + angleEnd) / 2;
            const xText = cx + (radius / 2) * Math.cos(middleAngle);
            const yText = cy + (radius / 2) * Math.sin(middleAngle);

            ctx.fillStyle = color;
            ctx.font = '16px Microsoft YaHei';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, xText, yText);
        }

         // Disable both buttons after either is clicked
         function disableButtons() {
          document.getElementById('yes-button').disabled = true;
          document.getElementById('no-button').disabled = true;
      }

        // Draw text inside the segments
        drawTextInSegment(`¥${redAmount}`, -Math.PI / 2, -Math.PI / 2 + redAngle, 'white');
        drawTextInSegment(`¥${greenAmount}`, -Math.PI / 2 + redAngle, -Math.PI / 2 + 2 * Math.PI, 'white');

        // Draw the legend inside the canvas
        function drawLegend() {
          // Draw the "Project Donation" legend
          ctx.fillStyle = 'green';
          ctx.fillRect(legendX, legendY, 20, legendItemHeight);
          ctx.fillStyle = 'black';
          ctx.font = '14px Microsoft YaHei';
          ctx.textBaseline = 'middle';
          ctx.fillText('项目组利息', legendX + 60, legendY + legendItemHeight / 2);

          // Draw the "Your Donation" legend
          ctx.fillStyle = 'red';
          ctx.fillRect(legendX, legendY + legendItemHeight + legendSpacing, 20, legendItemHeight);
          ctx.fillStyle = 'black';
          ctx.fillText('你的储蓄', legendX + 60, legendY + legendItemHeight + legendSpacing + legendItemHeight / 2);
      }

        // Draw the legend
        drawLegend();

        // Event handlers for the choices (Yes/No)
        document.getElementById('yes-button').addEventListener('click', function() {
            disableButtons();
            document.getElementById('feedbackMessage').textContent = '您选择储蓄。';
            jsPsych.pluginAPI.setTimeout(() => {
              jsPsych.finishTrial({
                response: 1,
                yours: redAmount,
                program: greenAmount,
              });
        }, 1000);
        });

        document.getElementById('no-button').addEventListener('click', function() {
          disableButtons();
          document.getElementById('feedbackMessage').textContent = '您选择不储蓄。';
          jsPsych.pluginAPI.setTimeout(() => {
            jsPsych.finishTrial({
              response: 0,
              yours: redAmount,
              program: greenAmount,
            });
        }, 1000);
      }
    );
    }
    },
    {
      type: jsPsychHtmlButtonResponse,
      stimulus: () => {
        return `
        <h3>本次储蓄的意愿是多少？</h3>
        <div class="slider-container">
            <label for="slider" class="label">1（比较小的意愿）到5（很强烈的意愿）</label>
            <input type="range" id="slider" min="1" max="5" value="1" step="1">
            <div class="range-labels">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
            </div>
        </div>
        `
      },
      choices: ['继 续'],
      on_load: () => {
        const slider = document.getElementById('slider');
        // const sliderValue = document.getElementById('sliderValue');

        slider.addEventListener('input', () => {
            // sliderValue.textContent = slider.value;
            slider.style.background = `linear-gradient(to right, #4caf50 ${((slider.value - 1) / 4) * 100}%, #d3d3d3 ${((slider.value - 1) / 4) * 100}%)`
        });
        // get the slider value
        document.querySelector('.jspsych-btn').addEventListener('click', () => {
            slider_value = slider.value;
        });
    },
    data: {
      task_type: 'deposit-slider'
    },
    on_finish: (data) => {
      data.response = slider_value;
      data.yours = jsPsych.timelineVariable('yours');
      data.program = jsPsych.timelineVariable('program');
    }
  }
  ],
  timeline_variables: donation_part3_data2,
  randomize_order: true,
}

const chart_deposit_procedure3 = {
  timeline: [
    {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: () => {
        return `
        <div class="form-container">
        <h3>本次的储蓄是：</h3>
        <div class="donation-container">
            <canvas id="donationCanvas" width="500" height="240"></canvas>
        </div>

        <div class="choice-container">
        <p>你的储蓄选择是：</p>
        <button id="yes-button" class="jspsych-btn">储 蓄</button>
        <button id="no-button" class="jspsych-btn">不储蓄</button>
    </div>
        <p id="feedbackMessage"></p>
        </div>
        `},
      choices: 'NO_KEYS',
      data: {
        task_type: 'deposit+' + jsPsych.timelineVariable('taskType'),
      },
      on_load: () => {
        const redAmount = jsPsych.timelineVariable('yours');
        const greenAmount = jsPsych.timelineVariable('program');
        const totalAmount = redAmount + greenAmount;

        // Calculate angles for each sector
        const redAngle = (2 * Math.PI * redAmount) / totalAmount;

        // Drawing parameters
        const cx = 200, cy = 100; // Center of the circle
        const radius = 100; // Radius of the circle


        // Legend position inside the canvas
        const legendX = 350;
        const legendY = 80;
        const legendItemHeight = 20;
        const legendSpacing = 10;

        // Get the canvas and context
        const canvas = document.getElementById('donationCanvas');
        const ctx = canvas.getContext('2d');

        // Draw the red segment
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + redAngle, false);
        ctx.closePath();
        ctx.fillStyle = 'red';
        ctx.fill();

        // Draw the green segment
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, -Math.PI / 2 + redAngle, -Math.PI / 2 + 2 * Math.PI, false);
        ctx.closePath();
        ctx.fillStyle = 'green';
        ctx.fill();

        // Function to draw text inside a segment
        function drawTextInSegment(text, angleStart, angleEnd, color) {
            const middleAngle = (angleStart + angleEnd) / 2;
            const xText = cx + (radius / 2) * Math.cos(middleAngle);
            const yText = cy + (radius / 2) * Math.sin(middleAngle);

            ctx.fillStyle = color;
            ctx.font = '16px Microsoft YaHei';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, xText, yText);
        }

         // Disable both buttons after either is clicked
         function disableButtons() {
          document.getElementById('yes-button').disabled = true;
          document.getElementById('no-button').disabled = true;
      }

        // Draw text inside the segments
        drawTextInSegment(`¥${redAmount}`, -Math.PI / 2, -Math.PI / 2 + redAngle, 'white');
        drawTextInSegment(`¥${greenAmount}`, -Math.PI / 2 + redAngle, -Math.PI / 2 + 2 * Math.PI, 'white');

        // Draw the legend inside the canvas
        function drawLegend() {
          // Draw the "Project Donation" legend
          ctx.fillStyle = 'green';
          ctx.fillRect(legendX, legendY, 20, legendItemHeight);
          ctx.fillStyle = 'black';
          ctx.font = '14px Microsoft YaHei';
          ctx.textBaseline = 'middle';
          ctx.fillText('项目组利息', legendX + 60, legendY + legendItemHeight / 2);

          // Draw the "Your Donation" legend
          ctx.fillStyle = 'red';
          ctx.fillRect(legendX, legendY + legendItemHeight + legendSpacing, 20, legendItemHeight);
          ctx.fillStyle = 'black';
          ctx.fillText('你的储蓄', legendX + 60, legendY + legendItemHeight + legendSpacing + legendItemHeight / 2);
      }

        // Draw the legend
        drawLegend();

        // Event handlers for the choices (Yes/No)
        document.getElementById('yes-button').addEventListener('click', function() {
            disableButtons();
            document.getElementById('feedbackMessage').textContent = '您选择储蓄。';
            jsPsych.pluginAPI.setTimeout(() => {
              jsPsych.finishTrial({
                response: 1,
                yours: redAmount,
                program: greenAmount,
              });
        }, 1000);
        });

        document.getElementById('no-button').addEventListener('click', function() {
          disableButtons();
          document.getElementById('feedbackMessage').textContent = '您选择不储蓄。';
          jsPsych.pluginAPI.setTimeout(() => {
            jsPsych.finishTrial({
              response: 0,
              yours: redAmount,
              program: greenAmount,
            });
        }, 1000);
      }
    );
    }
    },
    {
      type: jsPsychHtmlButtonResponse,
      stimulus: () => {
        return `
        <h3>本次储蓄的意愿是多少？</h3>
        <div class="slider-container">
            <label for="slider" class="label">1（比较小的意愿）到5（很强烈的意愿）</label>
            <input type="range" id="slider" min="1" max="5" value="1" step="1">
            <div class="range-labels">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
            </div>
        </div>
        `
      },
      choices: ['继 续'],
      on_load: () => {
        const slider = document.getElementById('slider');
        // const sliderValue = document.getElementById('sliderValue');

        slider.addEventListener('input', () => {
            // sliderValue.textContent = slider.value;
            slider.style.background = `linear-gradient(to right, #4caf50 ${((slider.value - 1) / 4) * 100}%, #d3d3d3 ${((slider.value - 1) / 4) * 100}%)`
        });
        // get the slider value
        document.querySelector('.jspsych-btn').addEventListener('click', () => {
            slider_value = slider.value;
        });
    },
    data: {
      task_type: 'deposit-slider'
    },
    on_finish: (data) => {
      data.response = slider_value;
      data.yours = jsPsych.timelineVariable('yours');
      data.program = jsPsych.timelineVariable('program');
    }
  }
  ],
  timeline_variables: donation_part3_data3,
  randomize_order: true,
}


const chart_donation_procedure1 = {
  timeline: [
    {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: () => {
        return `
        <div class="form-container">
        <h3>本次的捐赠是：</h3>
        <div class="donation-container">
            <canvas id="donationCanvas" width="500" height="240"></canvas>
        </div>

        <div class="choice-container">
        <p>你的捐赠选择是：</p>
        <button id="yes-button" class="jspsych-btn">捐  赠</button>
        <button id="no-button" class="jspsych-btn">不捐赠</button>
    </div>
        <p id="feedbackMessage"></p>
        </div>
        `},
      choices: 'NO_KEYS',
      data: {
        task_type: 'donation+' + jsPsych.timelineVariable('taskType'),
      },
      on_load: () => {
        const redAmount = jsPsych.timelineVariable('yours');
        const greenAmount = jsPsych.timelineVariable('program');
        const totalAmount = redAmount + greenAmount;

        // Calculate angles for each sector
        const redAngle = (2 * Math.PI * redAmount) / totalAmount;

        // Drawing parameters
        const cx = 200, cy = 100; // Center of the circle
        const radius = 100; // Radius of the circle


        // Legend position inside the canvas
        const legendX = 350;
        const legendY = 80;
        const legendItemHeight = 20;
        const legendSpacing = 10;

        // Get the canvas and context
        const canvas = document.getElementById('donationCanvas');
        const ctx = canvas.getContext('2d');

        // Draw the red segment
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + redAngle, false);
        ctx.closePath();
        ctx.fillStyle = 'red';
        ctx.fill();

        // Draw the green segment
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, -Math.PI / 2 + redAngle, -Math.PI / 2 + 2 * Math.PI, false);
        ctx.closePath();
        ctx.fillStyle = 'green';
        ctx.fill();

        // Function to draw text inside a segment
        function drawTextInSegment(text, angleStart, angleEnd, color) {
            const middleAngle = (angleStart + angleEnd) / 2;
            const xText = cx + (radius / 2) * Math.cos(middleAngle);
            const yText = cy + (radius / 2) * Math.sin(middleAngle);

            ctx.fillStyle = color;
            ctx.font = '16px Microsoft YaHei';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, xText, yText);
        }

         // Disable both buttons after either is clicked
         function disableButtons() {
          document.getElementById('yes-button').disabled = true;
          document.getElementById('no-button').disabled = true;
      }

        // Draw text inside the segments
        drawTextInSegment(`¥${redAmount}`, -Math.PI / 2, -Math.PI / 2 + redAngle, 'white');
        drawTextInSegment(`¥${greenAmount}`, -Math.PI / 2 + redAngle, -Math.PI / 2 + 2 * Math.PI, 'white');

        // Draw the legend inside the canvas
        function drawLegend() {
          // Draw the "Project Donation" legend
          ctx.fillStyle = 'green';
          ctx.fillRect(legendX, legendY, 20, legendItemHeight);
          ctx.fillStyle = 'black';
          ctx.font = '14px Microsoft YaHei';
          ctx.textBaseline = 'middle';
          ctx.fillText('项目组捐赠', legendX + 60, legendY + legendItemHeight / 2);

          // Draw the "Your Donation" legend
          ctx.fillStyle = 'red';
          ctx.fillRect(legendX, legendY + legendItemHeight + legendSpacing, 20, legendItemHeight);
          ctx.fillStyle = 'black';
          ctx.fillText('你的捐赠', legendX + 60, legendY + legendItemHeight + legendSpacing + legendItemHeight / 2);
      }

        // Draw the legend
        drawLegend();

        // Event handlers for the choices (Yes/No)
        document.getElementById('yes-button').addEventListener('click', function() {
            disableButtons();
            document.getElementById('feedbackMessage').textContent = '您选择捐赠。';
            jsPsych.pluginAPI.setTimeout(() => {
              jsPsych.finishTrial({
                response: 1,
                yours: redAmount,
                program: greenAmount,
              });
        }, 1000);
        });

        document.getElementById('no-button').addEventListener('click', function() {
          disableButtons();
          document.getElementById('feedbackMessage').textContent = '您选择不捐赠。';
          jsPsych.pluginAPI.setTimeout(() => {
            jsPsych.finishTrial({
              response: 0,
              yours: redAmount,
              program: greenAmount,
            });
        }, 1000);
      }
    );
    }
    },
    {
      type: jsPsychHtmlButtonResponse,
      stimulus: () => {
        return `
        <h3>本次捐赠的意愿是多少？</h3>
        <div class="slider-container">
            <label for="slider" class="label">1（比较小的意愿）到5（很强烈的意愿）</label>
            <input type="range" id="slider" min="1" max="5" value="1" step="1">
            <div class="range-labels">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
            </div>
        </div>
        `
      },
      choices: ['继 续'],
      on_load: () => {
        const slider = document.getElementById('slider');
        // const sliderValue = document.getElementById('sliderValue');

        slider.addEventListener('input', () => {
            // sliderValue.textContent = slider.value;
            slider.style.background = `linear-gradient(to right, #4caf50 ${((slider.value - 1) / 4) * 100}%, #d3d3d3 ${((slider.value - 1) / 4) * 100}%)`
        });
        // get the slider value
        document.querySelector('.jspsych-btn').addEventListener('click', () => {
            slider_value = slider.value;
        });
    },
    data: {
      task_type: 'donation-slider'
    },
    on_finish: (data) => {
      data.response = slider_value;
      data.yours = jsPsych.timelineVariable('yours');
      data.program = jsPsych.timelineVariable('program');
    }
  }
  ],
  timeline_variables: donation_part3_data1,
  randomize_order: true,
}

const chart_donation_procedure2 = {
  timeline: [
    {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: () => {
        return `
        <div class="form-container">
        <h3>本次的捐赠是：</h3>
        <div class="donation-container">
            <canvas id="donationCanvas" width="500" height="240"></canvas>
        </div>

        <div class="choice-container">
        <p>你的捐赠选择是：</p>
        <button id="yes-button" class="jspsych-btn">捐  赠</button>
        <button id="no-button" class="jspsych-btn">不捐赠</button>
    </div>
        <p id="feedbackMessage"></p>
        </div>
        `},
      choices: 'NO_KEYS',
      data: {
        task_type: 'donation+' + jsPsych.timelineVariable('taskType'),
      },
      on_load: () => {
        const redAmount = jsPsych.timelineVariable('yours');
        const greenAmount = jsPsych.timelineVariable('program');
        const totalAmount = redAmount + greenAmount;

        // Calculate angles for each sector
        const redAngle = (2 * Math.PI * redAmount) / totalAmount;

        // Drawing parameters
        const cx = 200, cy = 100; // Center of the circle
        const radius = 100; // Radius of the circle


        // Legend position inside the canvas
        const legendX = 350;
        const legendY = 80;
        const legendItemHeight = 20;
        const legendSpacing = 10;

        // Get the canvas and context
        const canvas = document.getElementById('donationCanvas');
        const ctx = canvas.getContext('2d');

        // Draw the red segment
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + redAngle, false);
        ctx.closePath();
        ctx.fillStyle = 'red';
        ctx.fill();

        // Draw the green segment
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, -Math.PI / 2 + redAngle, -Math.PI / 2 + 2 * Math.PI, false);
        ctx.closePath();
        ctx.fillStyle = 'green';
        ctx.fill();

        // Function to draw text inside a segment
        function drawTextInSegment(text, angleStart, angleEnd, color) {
            const middleAngle = (angleStart + angleEnd) / 2;
            const xText = cx + (radius / 2) * Math.cos(middleAngle);
            const yText = cy + (radius / 2) * Math.sin(middleAngle);

            ctx.fillStyle = color;
            ctx.font = '16px Microsoft YaHei';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, xText, yText);
        }

         // Disable both buttons after either is clicked
         function disableButtons() {
          document.getElementById('yes-button').disabled = true;
          document.getElementById('no-button').disabled = true;
      }

        // Draw text inside the segments
        drawTextInSegment(`¥${redAmount}`, -Math.PI / 2, -Math.PI / 2 + redAngle, 'white');
        drawTextInSegment(`¥${greenAmount}`, -Math.PI / 2 + redAngle, -Math.PI / 2 + 2 * Math.PI, 'white');

        // Draw the legend inside the canvas
        function drawLegend() {
          // Draw the "Project Donation" legend
          ctx.fillStyle = 'green';
          ctx.fillRect(legendX, legendY, 20, legendItemHeight);
          ctx.fillStyle = 'black';
          ctx.font = '14px Microsoft YaHei';
          ctx.textBaseline = 'middle';
          ctx.fillText('项目组捐赠', legendX + 60, legendY + legendItemHeight / 2);

          // Draw the "Your Donation" legend
          ctx.fillStyle = 'red';
          ctx.fillRect(legendX, legendY + legendItemHeight + legendSpacing, 20, legendItemHeight);
          ctx.fillStyle = 'black';
          ctx.fillText('你的捐赠', legendX + 60, legendY + legendItemHeight + legendSpacing + legendItemHeight / 2);
      }

        // Draw the legend
        drawLegend();

        // Event handlers for the choices (Yes/No)
        document.getElementById('yes-button').addEventListener('click', function() {
            disableButtons();
            document.getElementById('feedbackMessage').textContent = '您选择捐赠。';
            jsPsych.pluginAPI.setTimeout(() => {
              jsPsych.finishTrial({
                response: 1,
                yours: redAmount,
                program: greenAmount,
              });
        }, 1000);
        });

        document.getElementById('no-button').addEventListener('click', function() {
          disableButtons();
          document.getElementById('feedbackMessage').textContent = '您选择不捐赠。';
          jsPsych.pluginAPI.setTimeout(() => {
            jsPsych.finishTrial({
              response: 0,
              yours: redAmount,
              program: greenAmount,
            });
        }, 1000);
      }
    );
    }
    },
    {
      type: jsPsychHtmlButtonResponse,
      stimulus: () => {
        return `
        <h3>本次捐赠的意愿是多少？</h3>
        <div class="slider-container">
            <label for="slider" class="label">1（比较小的意愿）到5（很强烈的意愿）</label>
            <input type="range" id="slider" min="1" max="5" value="1" step="1">
            <div class="range-labels">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
            </div>
        </div>
        `
      },
      choices: ['继 续'],
      on_load: () => {
        const slider = document.getElementById('slider');
        // const sliderValue = document.getElementById('sliderValue');

        slider.addEventListener('input', () => {
            // sliderValue.textContent = slider.value;
            slider.style.background = `linear-gradient(to right, #4caf50 ${((slider.value - 1) / 4) * 100}%, #d3d3d3 ${((slider.value - 1) / 4) * 100}%)`
        });
        // get the slider value
        document.querySelector('.jspsych-btn').addEventListener('click', () => {
            slider_value = slider.value;
        });
    },
    data: {
      task_type: 'donation-slider'
    },
    on_finish: (data) => {
      data.response = slider_value;
      data.yours = jsPsych.timelineVariable('yours');
      data.program = jsPsych.timelineVariable('program');
    }
  }
  ],
  timeline_variables: donation_part3_data2,
  randomize_order: true,
}

const chart_donation_procedure3 = {
  timeline: [
    {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: () => {
        return `
        <div class="form-container">
        <h3>本次的捐赠是：</h3>
        <div class="donation-container">
            <canvas id="donationCanvas" width="500" height="240"></canvas>
        </div>

        <div class="choice-container">
        <p>你的捐赠选择是：</p>
        <button id="yes-button" class="jspsych-btn">捐  赠</button>
        <button id="no-button" class="jspsych-btn">不捐赠</button>
    </div>
        <p id="feedbackMessage"></p>
        </div>
        `},
      choices: 'NO_KEYS',
      data: {
        task_type: 'donation+' + jsPsych.timelineVariable('taskType'),
      },
      on_load: () => {
        const redAmount = jsPsych.timelineVariable('yours');
        const greenAmount = jsPsych.timelineVariable('program');
        const totalAmount = redAmount + greenAmount;

        // Calculate angles for each sector
        const redAngle = (2 * Math.PI * redAmount) / totalAmount;

        // Drawing parameters
        const cx = 200, cy = 100; // Center of the circle
        const radius = 100; // Radius of the circle


        // Legend position inside the canvas
        const legendX = 350;
        const legendY = 80;
        const legendItemHeight = 20;
        const legendSpacing = 10;

        // Get the canvas and context
        const canvas = document.getElementById('donationCanvas');
        const ctx = canvas.getContext('2d');

        // Draw the red segment
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + redAngle, false);
        ctx.closePath();
        ctx.fillStyle = 'red';
        ctx.fill();

        // Draw the green segment
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, -Math.PI / 2 + redAngle, -Math.PI / 2 + 2 * Math.PI, false);
        ctx.closePath();
        ctx.fillStyle = 'green';
        ctx.fill();

        // Function to draw text inside a segment
        function drawTextInSegment(text, angleStart, angleEnd, color) {
            const middleAngle = (angleStart + angleEnd) / 2;
            const xText = cx + (radius / 2) * Math.cos(middleAngle);
            const yText = cy + (radius / 2) * Math.sin(middleAngle);

            ctx.fillStyle = color;
            ctx.font = '16px Microsoft YaHei';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, xText, yText);
        }

         // Disable both buttons after either is clicked
         function disableButtons() {
          document.getElementById('yes-button').disabled = true;
          document.getElementById('no-button').disabled = true;
      }

        // Draw text inside the segments
        drawTextInSegment(`¥${redAmount}`, -Math.PI / 2, -Math.PI / 2 + redAngle, 'white');
        drawTextInSegment(`¥${greenAmount}`, -Math.PI / 2 + redAngle, -Math.PI / 2 + 2 * Math.PI, 'white');

        // Draw the legend inside the canvas
        function drawLegend() {
          // Draw the "Project Donation" legend
          ctx.fillStyle = 'green';
          ctx.fillRect(legendX, legendY, 20, legendItemHeight);
          ctx.fillStyle = 'black';
          ctx.font = '14px Microsoft YaHei';
          ctx.textBaseline = 'middle';
          ctx.fillText('项目组捐赠', legendX + 60, legendY + legendItemHeight / 2);

          // Draw the "Your Donation" legend
          ctx.fillStyle = 'red';
          ctx.fillRect(legendX, legendY + legendItemHeight + legendSpacing, 20, legendItemHeight);
          ctx.fillStyle = 'black';
          ctx.fillText('你的捐赠', legendX + 60, legendY + legendItemHeight + legendSpacing + legendItemHeight / 2);
      }

        // Draw the legend
        drawLegend();

        // Event handlers for the choices (Yes/No)
        document.getElementById('yes-button').addEventListener('click', function() {
            disableButtons();
            document.getElementById('feedbackMessage').textContent = '您选择捐赠。';
            jsPsych.pluginAPI.setTimeout(() => {
              jsPsych.finishTrial({
                response: 1,
                yours: redAmount,
                program: greenAmount,
              });
        }, 1000);
        });

        document.getElementById('no-button').addEventListener('click', function() {
          disableButtons();
          document.getElementById('feedbackMessage').textContent = '您选择不捐赠。';
          jsPsych.pluginAPI.setTimeout(() => {
            jsPsych.finishTrial({
              response: 0,
              yours: redAmount,
              program: greenAmount,
            });
        }, 1000);
      }
    );
    }
    },
    {
      type: jsPsychHtmlButtonResponse,
      stimulus: () => {
        return `
        <h3>本次捐赠的意愿是多少？</h3>
        <div class="slider-container">
            <label for="slider" class="label">1（比较小的意愿）到5（很强烈的意愿）</label>
            <input type="range" id="slider" min="1" max="5" value="1" step="1">
            <div class="range-labels">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
            </div>
        </div>
        `
      },
      choices: ['继 续'],
      on_load: () => {
        const slider = document.getElementById('slider');
        // const sliderValue = document.getElementById('sliderValue');

        slider.addEventListener('input', () => {
            // sliderValue.textContent = slider.value;
            slider.style.background = `linear-gradient(to right, #4caf50 ${((slider.value - 1) / 4) * 100}%, #d3d3d3 ${((slider.value - 1) / 4) * 100}%)`
        });
        // get the slider value
        document.querySelector('.jspsych-btn').addEventListener('click', () => {
            slider_value = slider.value;
        });
    },
    data: {
      task_type: 'donation-slider'
    },
    on_finish: (data) => {
      data.response = slider_value;
      data.yours = jsPsych.timelineVariable('yours');
      data.program = jsPsych.timelineVariable('program');
    }
  }
  ],
  timeline_variables: donation_part3_data3,
  randomize_order: true,
}

const chart_deposit_procedure_timeline1 = {
  timeline: [
    {
      type: jsPsychHtmlButtonResponse,
      stimulus: () => {
        return `
        <div class="form-container">
        <p>在接下来的部分中，您将看到两个部分的储蓄：<h>您的储蓄部分（以红色显示的饼状图区域）</h>和相应的<span style="color:green">实验者给您的利息（以绿色显示的饼状图区域）</span>。这两部分的<h>总和将保持为 100 元</h>。无论您选择的储蓄额度是多少，实验者都会补足到 100 元的总额。</p>
        </div>
        `
    },
    choices: ['继续'],
  },
  chart_deposit_procedure1
  ]
}

const chart_donation_procedure_timeline1 = {
  timeline: [
    {
      type: jsPsychHtmlButtonResponse,
      stimulus: () => {
        return `
        <div class="form-container">
        <p>在接下来的部分中，您将看到两个部分的捐赠分配：<h>您的捐赠部分（以红色显示的饼状图区域）</h>和相应的<span style="color:green">实验者的捐赠部分（以绿色显示的饼状图区域）</span>。这两部分的<h>总和将保持为 100 元</h>。无论您选择的捐赠额度是多少，实验者都会补足到 100 元的总额</p>
        </div>
        `
    },
    choices: ['继续'],
  },
  chart_donation_procedure1
  ]

}

const chart_donation_procedure_timeline2 = {
  timeline: [
    {
      type: jsPsychHtmlButtonResponse,
      stimulus: () => {
        return `
        <div class="form-container">
        <p>在接下来的试次中，您将看到不同的捐赠安排。与之前的规则不同，您和对应的实验者的捐赠<h>总和将不固定</h>。请注意，您的捐赠额度在每次选择时会受到 <h>20 元的限制</h>。</p>
        </div>
        `
    },
    choices: ['继续'],
  },
  chart_donation_procedure2
  ]
}

const chart_deposit_procedure_timeline2 = {
  timeline: [
    {
      type: jsPsychHtmlButtonResponse,
      stimulus: () => {
        return `
        <div class="form-container">
        <p>在接下来的试次中，您将看到不同的储蓄安排。与之前的规则不同，您收到的储蓄金额的<h>总和将不固定</h>。请注意，您自己的的储蓄额度在每次选择时会受到 <h>20 元的限制</h>。</p>
        </div>
        `
    },
    choices: ['继续'],
  },
  chart_deposit_procedure2
  ]
}

const chart_deposit_procedure_timeline3 = {
  timeline: [
    {
      type: jsPsychHtmlButtonResponse,
      stimulus: () => {
        return `
        <div class="form-container">
        <p>在接下来的试次中，您将看到不同的储蓄安排。与之前的规则不同，您收到的储蓄金额的<h>总和将不固定</h>。请注意，您自己的的储蓄额度在每次选择时会受到 <h>60 元的限制</h>。</p>
        </div>
        `
    },
    choices: ['继续'],
  },
  chart_deposit_procedure3
  ]
}

const chart_donation_procedure_timeline3 = {
  timeline: [
    {
      type: jsPsychHtmlButtonResponse,
      stimulus: () => {
        return `
        <div class="form-container">
        <p>在接下来的试次中，您将看到不同的捐赠安排。与之前的规则不同，您和对应的实验者的捐赠<h>总和将不固定</h>。请注意，您的捐赠额度在每次选择时会受到 <h>60 元的限制</h>。</p>
        </div>
        `
    },
    choices: ['继续'],
  },
  chart_donation_procedure3
  ]
}


// deposit donation task
main_timeline.push(
  part3_tutorial,
  part3_deposit,
  reset_variables,
  chart_deposit_procedure_timeline1,
  reset_variables,
  chart_deposit_procedure_timeline2,
  reset_variables,
  chart_deposit_procedure_timeline3,
  part3_donation,
  reset_variables,
  chart_donation_procedure_timeline1,
  reset_variables,
  chart_donation_procedure_timeline2,
  reset_variables,
  chart_donation_procedure_timeline3

)

// say goodbye
const end = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: () => {
    let html = "<p>实验结束，感谢您的参与！</p>";
    html += "<p>Experiment is over. Thank you for your participation!</p>";
    return html;
  },
  trial_duration: 4000,
  choices: " ",
  extensions: [{ type: Naodao }],
  response_end_trial: true,
};
main_timeline.push(end);

jsPsych.run(main_timeline);


// Function to draw the diagram
function drawDiagram(hoverIndex = -1) {
  // Clear previous drawings
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  circles.length = 0; // Reset circles array

  ctx.fillStyle = "black";
  ctx.font = "700 18px Microsoft Yahei";
  ctx.textAlign = "center";
  ctx.fillText('你获得', 50, 135);
  ctx.fillText('他人获得', 50, 270);

  sov_list.forEach((node, index) => {
      const isHovered = index === hoverIndex;
      const isClicked = index === clickedNodeIndex;
      const scaleFactor = isHovered ? 1.2 : 1;
      const rectWidthCurrent = rectWidth * scaleFactor;
      const rectHeightCurrent = rectHeight * scaleFactor;
      const circleRadiusCurrent = circleRadius * scaleFactor;
      const circleDistanceCurrent = circleDistance * scaleFactor;

      const xPos = xStart + index * spacing;
      const xCircle = xPos + rectWidth / 2; // Center position horizontally
      const yCircle = yTopRect + rectHeight + circleDistance; // Center position vertically

      // Position adjustments to keep elements centered
      const xRectTop = xCircle - rectWidthCurrent / 2;
      const xRectBottom = xCircle - rectWidthCurrent / 2;
      const yTop = yCircle - circleRadiusCurrent - circleDistanceCurrent - rectHeightCurrent; // Top rectangle position
      const yBottomRect = yCircle + circleRadiusCurrent + circleDistanceCurrent; // Bottom rectangle position

      // Colors to use based on clicked state
      const rectColor = isClicked ? clickedRectColor : defaultRectColor;
      const lineColor = isClicked ? clickedLineColor : defaultLineColor;

      // Draw top rectangle
      ctx.fillStyle = rectColor;
      ctx.fillRect(xRectTop, yTop, rectWidthCurrent, rectHeightCurrent);
      ctx.fillStyle = "white";
      ctx.font = "18px Arial";
      ctx.textAlign = "center";
      ctx.fillText(node.youReceive, xRectTop + rectWidthCurrent / 2, yTop + rectHeightCurrent / 2 + 6);

      // Draw line to circle
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(xCircle, yTop + rectHeightCurrent);
      ctx.lineTo(xCircle, yCircle - circleRadiusCurrent);
      ctx.stroke();

      // Store circle positions to draw them later
      circles.push({ x: xCircle, y: yCircle, r: circleRadiusCurrent, index: index + 1 });

      // Draw line to bottom rectangle
      ctx.beginPath();
      ctx.moveTo(xCircle, yCircle + circleRadiusCurrent);
      ctx.lineTo(xCircle, yBottomRect);
      ctx.stroke();

      // Draw bottom rectangle
      ctx.fillStyle = rectColor;
      ctx.fillRect(xRectBottom, yBottomRect, rectWidthCurrent, rectHeightCurrent);
      ctx.fillStyle = "white";
      ctx.fillText(node.otherReceives, xRectBottom + rectWidthCurrent / 2, yBottomRect + rectHeightCurrent / 2 + 6);

      // Connecting horizontal lines between circles
      if (index > 0) {
          const prevXCircle = xStart + (index - 1) * spacing + rectWidth / 2;
          ctx.strokeStyle = "#4682B4";
          ctx.beginPath();
          ctx.moveTo(prevXCircle, yCircle);
          ctx.lineTo(xCircle, yCircle);
          ctx.stroke();
      }
  });

  // Draw circles last to ensure they appear on top
  circles.forEach((circle, index) => {
      const isClicked = index === clickedNodeIndex;
      const circleColor = isClicked ? clickedCircleColor : defaultCircleColor;

      // Apply shadow effects to make the central node look like a button
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 4;


      ctx.beginPath();
      ctx.arc(circle.x, circle.y, circle.r, 0, 2 * Math.PI);
      ctx.fillStyle = circleColor;
      ctx.fill();

      // Draw border to enhance button-like appearance
        ctx.lineWidth = 2;
      ctx.strokeStyle = "white";
      ctx.stroke();

      // Reset shadow effects for next drawing
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
  });
}

// Click event handler
function handleCanvasClick(e) {
  // Get the canvas position on the screen
  const rect = canvas.getBoundingClientRect();
  // Translate mouse coordinates to the canvas coordinates
  const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
  const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);


  let clicked = false;

  // Check if the click falls inside any of the circles
  circles.forEach((circle, index) => {
    const dx = mouseX - circle.x;
    const dy = mouseY - circle.y;
    // Check if the distance from the click point to the circle's center is within the radius
    if (Math.sqrt(dx * dx + dy * dy) <= circle.r) {
      // get the button
      const button = document.querySelector('.jspsych-btn');
      // enable the button
      button.disabled = false;

      // Set the clicked node index to match the circle index
      clickedNodeIndex = index;  // Zero-based index directly correlates with data
      console.log('Clicked on node:', clickedNodeIndex + 1);
      clicked = true;
    }
  });

  // Redraw the diagram with the new clicked index only if a circle was clicked
  if (clicked) {
    drawDiagram();
  }
}

// Mouse move event handler
function handleMouseMove(e) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
  const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);

  let hoverIndex = -1;

  circles.forEach((circle, index) => {
    const dx = mouseX - circle.x;
    const dy = mouseY - circle.y;
    if (Math.sqrt(dx * dx + dy * dy) <= circle.r) {
      hoverIndex = index;
    }
  });

  drawDiagram(hoverIndex);
}

// Function to check the submitted sum
function checkSum() {
  // Provide feedback based on the input
  const feedback = document.getElementById('feedback');

  // Get user input from the text box
  let input = document.getElementById('sum-input');
  if (!input.value) {
    feedback.textContent = '请输入一个数字！';
    feedback.style.color = "red";
    return;
  } else {
  // make input disabled after submission
  input.disabled = true;
  // make submit button disabled after submission
  document.querySelector('.jspsych-btn').disabled = true;

  const userSum = parseInt(input.value, 10);
  
  let correctSum = sumNumbers.reduce((a, b) => a + b, 0);

  if (userSum === correctSum) {
      calculation_money += 2;
      feedback.textContent = "回答正确 ！";
      feedback.style.color = "green";
  } else {
      feedback.textContent = "回答错误！正确答案为" + correctSum;
      feedback.style.color = "red";
  }
  jsPsych.pluginAPI.setTimeout(() => {
    jsPsych.finishTrial({
      rt: performance.now() - onset_time,
      response: userSum,
      Correct: userSum === correctSum,
    });
  }, 1000);
}
}
// Function to draw the question and handle options interactions
function drawQuestion(c) {
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.font = '24px "Microsoft YaHei"';

  const item = multi_choice_items[trial_index];
  const question = trial_index +  1 + '. ' + item.question;
  const options = item.options;
  correctAnswerIndex = options.indexOf(item.answer);

  // Draw the question centered at the top
  const questionX = 100; // Adjust this as needed for your design
  const startY = 180; // Adjust for the question's vertical position

  ctx.fillText(question, questionX, startY);

  const optionX = questionX; // Keep the options aligned with the question
  const optionYStart = startY + 100;
  const optionHeight = 30;
  const padding = 10;
  const clickableRegions = [];

  // Function to draw all options
  function drawOptions() {
    // Clear the region below the question
    ctx.clearRect(0, startY + 80, c.width, c.height - startY - 100);

    options.forEach((option, index) => {
      // Determine the Y position for each option
      const optionY = optionYStart + index * (optionHeight + padding);

      // Change font size if hovered
      if (hoveredNodeIndex === index) {
        ctx.font = '22px "Microsoft YaHei"';
      } else {
        ctx.font = '20px "Microsoft YaHei"';
      }

      const textWidth = ctx.measureText(option).width;

      // Create the clickable region with appropriate padding
      const region = {
        option,
        x: optionX,
        y: optionY - optionHeight / 2,
        width: textWidth + padding * 2,
        height: optionHeight
      };

      // Set color based on whether it's selected
      if (index === clickedNodeIndex) {
        ctx.fillStyle = 'blue';
        ctx.font = '600 20px "Microsoft YaHei"'; // Bold font
      } else {
        ctx.fillStyle = 'black'; // Default text color
      }

      // Draw the option text
      ctx.fillText(option, optionX, optionY);
      clickableRegions[index] = region; // Store the clickable region
    });
  }

  // Add a mouse move event to detect hovering
  c.addEventListener('mousemove', function handleMouseMove(e) {
    const rect = c.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (c.width / rect.width);
    const mouseY = (e.clientY - rect.top) * (c.height / rect.height);

    hoveredNodeIndex = null; // Reset the hovered state

    clickableRegions.forEach((region, index) => {
      if (
        mouseX >= region.x &&
        mouseX <= region.x + region.width &&
        mouseY >= region.y &&
        mouseY <= region.y + region.height
      ) {
        hoveredNodeIndex = index; // Set the hovered index
      }
    });

    drawOptions(); // Redraw the options with hover effect
  });

  // Add a click event to select an option
  c.addEventListener('click', function handleClick(e) {
    const rect = c.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) * (c.width / rect.width);
    const clickY = (e.clientY - rect.top) * (c.height / rect.height);

    clickableRegions.forEach((region, index) => {
      if (
        clickX >= region.x &&
        clickX <= region.x + region.width &&
        clickY >= region.y &&
        clickY <= region.y + region.height
      ) {
        clickedNodeIndex = index; // Mark this index as selected
      }
    });

    drawOptions(); // Redraw options with selection effect
  });

  // Initial drawing of the options
  drawOptions();
}

// Function to check if the selected option is correct
function checkAnswer(e) {
  const canvas  = document.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const options_ = multi_choice_items[trial_index].options;
  const stimulus_ = multi_choice_items[trial_index].question;
  const clickedOption = options_[clickedNodeIndex];
  if (clickedNodeIndex === -1) {
    ctx.fillStyle = 'red';
    ctx.fillText('请先选择一个选项！', 100, 440);
   
  } else if (clickedNodeIndex === correctAnswerIndex) {
    multi_choice_money += 3;
    trial_index ++;
    clickedNodeIndex = -1;
    e.target.disabled = true;
    ctx.fillStyle = 'green';
    ctx.fillText('答案正确！', 100, 440);
    jsPsych.pluginAPI.setTimeout(() => {
      jsPsych.finishTrial({
        stimulus: stimulus_,
        response: clickedOption,
        correct: true,
      });
    }, 1000);
  } else {
    trial_index ++;
    clickedNodeIndex = -1;
    e.target.disabled = true;
    ctx.fillStyle = 'red';
    ctx.fillText('答案错误！正确答案为：' + options_[correctAnswerIndex], 100, 440);
    jsPsych.pluginAPI.setTimeout(() => {
      jsPsych.finishTrial({
        stimulus: stimulus_,
        response: clickedOption,
        correct: false,
      });
    }, 1000);
  }
}

function donation_main() {
  return {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: () => {
    return `
    <div class="money-remaining">
      剩余金额：<span id="remainingMoney">${remaining_money}</span> 元
  </div>
    <div class="form-container">
      <div class="question-container"></div>
      <div class="option-container">
        <input type="checkbox" id="noDonation" name="donationOptions" value="noDonation">
        <label for="noDonation">我选择不捐赠</label>
      </div>
      <div class="option-container">
        <input type="checkbox" id="yesDonation" name="donationOptions" value="yesDonation">
        <label for="yesDonation">我选择捐赠</label>
        <div id="donationHint" class="donation-hint">, 并且捐赠<input type="number" id="donationAmount" class="donation-input" placeholder="请输入金额">元</div>
      </div>
      <button id="submitButton" class="jspsych-btn">提交</button>
      <p id="feedbackMessage"></p>
  </div>
    `
  },
  choices: 'NO_KEYS',
  on_load: () => {
    onset_time = performance.now();

    let plan = '';
    let trial_data;
    if (!repeat_flag) {
      trial_data = donation_program[trial_index];
    if (if_buy) {
      plan = Math.random() > 0.5 ? trial_data.planA : trial_data.planB;
    } else {
      plan = '那么这个慈善项目可能会选择方案A或者方案B，并且<h>这两个方案被选择的概率未知</h>，那么你是否会选择捐赠？以及如果选择捐赠的话捐赠的金额是多少呢？';
    }} else { 
      trial_data = repeat_donation_program[trial_index];
      plan = Math.random() > 0.5 ? trial_data.planA : trial_data.planB;
      plan = '由于你并没有购买关于' + trial_data.flag + '的信息，我们<h>免费</h>为你提供此信息。' + plan;
    };
    document.querySelector('.question-container').innerHTML = plan;
    const noDonationCheckbox = document.getElementById('noDonation');
    const yesDonationCheckbox = document.getElementById('yesDonation');
    const donationInput = document.getElementById('donationAmount');
    const donationHint = document.getElementById('donationHint');
    const feedbackMessage = document.getElementById('feedbackMessage');
    const submitButton = document.getElementById('submitButton');

    // Show or hide donation amount input based on the selection
    yesDonationCheckbox.addEventListener('change', function () {
        donationHint.style.display = this.checked ? 'inline-block' : 'none';
        if (this.checked) {
            noDonationCheckbox.checked = false; // Uncheck the "no donation" option
        }
    });

    // Ensure only one option can be checked at a time
    noDonationCheckbox.addEventListener('change', function () {
        if (this.checked) {
            yesDonationCheckbox.checked = false;
            donationHint.style.display = 'none';
        }
    });

    // Handle the form submission
    submitButton.addEventListener('click', function () {
      // disable the input and button after submission
        if (noDonationCheckbox.checked) {
          noDonationCheckbox.disabled = true;
          yesDonationCheckbox.disabled = true;
          donationInput.disabled = true;
          submitButton.disabled = true;
            feedbackMessage.textContent = '您选择了不捐赠。';
            feedbackMessage.style.color = 'black';
            let save_info = {
              stimulus: plan,
              check_donation: false,
            };
            if (!repeat_flag) {
              save_info.task_type = 'donation_main';
            } else {
              save_info.task_type = 'repeat_donation_main';
            }
            jsPsych.pluginAPI.setTimeout(() => {jsPsych.finishTrial(save_info)}, 1000);
        } else if (yesDonationCheckbox.checked) {

            const donationAmount = donationInput.value;
            if (donationAmount && !isNaN(donationAmount) && (donationAmount > 0) && (donationAmount <= remaining_money)) { // to check if the input is less than the remaining money
                feedbackMessage.textContent = `您选择捐赠 ${donationAmount} 元。`;
                feedbackMessage.style.color = 'green';

                remaining_money -= donationAmount;

                document.getElementById('remainingMoney').textContent = remaining_money;

                noDonationCheckbox.disabled = true;
                yesDonationCheckbox.disabled = true;
                donationInput.disabled = true;
                submitButton.disabled = true;
                let save_info = {
                  check_donation: true,
                  response: donationAmount,
                  stimulus: plan,
                };
                if (!repeat_flag) {
                  save_info.task_type = 'donation_main';
                } else {
                  save_info.task_type = 'repeat_donation_main';
                }
                jsPsych.pluginAPI.setTimeout(() => {jsPsych.finishTrial(save_info);
              }, 1000);
            } else {
                feedbackMessage.textContent = '请输入有效的捐赠金额。';
                feedbackMessage.style.color = 'red';
            }
        } else {
            feedbackMessage.textContent = '请选择一项捐赠选项。';
            feedbackMessage.style.color = 'red';
        }
    });
  },
  on_finish: (data) =>{
    data.rt = performance.now() - onset_time;
    trial_index ++;
  }
  }   
}

//Function to draw multi-line text on a canvas with automatic word wrapping
function drawWrappedChineseText(ctx, text, x, y, maxWidth, lineHeight) {
  ctx.clearRect(0, 0, ctx.width, ctx.height);

  let line = ''; // Current line of text
  let lineY = y; // Y-coordinate for the current line

  for (const char of text) {
      const testLine = line + char;
      const testWidth = ctx.measureText(testLine).width;

      if (testWidth > maxWidth && line.length > 0) {
          // Draw the current line and start a new one
          ctx.fillText(line, x, lineY);
          line = char; // Start a new line with the current character
          lineY += lineHeight; // Move to the next line
      } else {
          // Add the character to the current line
          line = testLine;
      }
  }

  // Draw the last line that hasn't been drawn yet
  if (line) {
      ctx.fillText(line, x, lineY);
  }
}

// Function to check the situation based on the program name
function checkSituation() {
  switch (program_name ) {
    case '爱小丫女生加油计划':
      return '这个项目通过送去小丫包，开展小丫课堂，为欠发达地区女孩普及生理卫生和自我保护等知识，帮助她们健康自信的成长。';
    case '让儿童免于被性侵':
      return '这个项目面向欠发达地区的乡村儿童开展性安全健康教育课程，并发放健康卫生包，旨在普及性教育知识、保护儿童远离性侵害。';
    case '帮宝贝战胜先天病':
      return '这个项目为了让先天病患儿能接受治疗，早日像正常的孩子一样玩耍、奔跑、健康成长，通过与优秀医院合作，资助孤困先天病患儿接受治疗。';
    case '给孤儿妈妈般的爱':
      return '这个项目根据孤儿各年龄阶段以及不同残障程度特需儿童的发展特点，设计教学内容和方法，为儿童创造适合他/她的教育机会。系统地培训上千名"春晖妈妈”，教会她们运用回应式教育抚育理念与福利院儿童建立情感依恋，持续不断地回应他们的需求，帮助他们在家庭般的关爱中成长。';
}
}