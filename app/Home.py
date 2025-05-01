import streamlit as st

st.set_page_config(page_title='Attendance System', layout='wide')

st.markdown(
    """
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');

    body {
        font-family: 'Poppins', sans-serif;
    }

    .logo-container {
        position: relative;
        display: inline-block;
    }

    .tooltip {
        visibility: hidden;
        width: 300px;
        background-color: #FFFFFF;
        color: #000000;
        text-align: center;
        border: 1px solid #000000;
        border-radius: 0;
        padding: 10px;
        position: absolute;
        z-index: 1;
        bottom: 110%;
        left: 50%;
        transform: translateX(-50%);
        opacity: 0;
        transition: opacity 0.3s ease;
        font-size: 16px;
        font-weight: normal;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .logo-container:hover .tooltip {
        visibility: visible;
        opacity: 1;
    }
    </style>

    <div style="display: flex; justify-content: left; align-items: center; margin-bottom: 10px;">
        <div class="logo-container">
            <img src="https://media.loveitopcdn.com/3807/logo-dh-quoc-gia-ha-noi-vector-dongphucsongphu1.png" alt="VNU Logo" style="width: 50px;">
            <div class="tooltip">Vietnam National University</div>
        </div>
        <div class="logo-container" style="margin-left: 5px;">
            <img src="https://admission.isvnu.vn/images/user/21162/logoaengapositiveafullacolora10.png" alt="VNUIS Logo" style="width: 160px;">
            <div class="tooltip">International School</div>
        </div>
    </div>
    """, unsafe_allow_html=True
)

# Marquee section
st.markdown(
    """
    <style>
    .marquee-wrapper {
        position: relative;
        overflow: hidden;
        background: linear-gradient(90deg, #003366 0%, #005580 30%, #0077AA 70%, #0099CC 100%);
        color: #FFFFFF;
    }
    .marquee-border {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 3px;
        background: linear-gradient(90deg, #FFD700 0%, #FFBF00 50%, #FF9F00 100%);
        z-index: 1;
    }
    .marquee {
        position: relative;
        padding-top: 3px;
        overflow: hidden;
    }
    .marquee div {
        display: inline-block;
        white-space: nowrap;
        padding-left: 100%;
        animation: marquee 30s linear infinite;
        font-style: italic;
        font-weight: bold;
        font-size: 18px;
        line-height: calc(18px * 1.5); 
        letter-spacing: calc(18px * 0.02); 
    }
    @keyframes marquee {
        0% { transform: translateX(100%); }
        100% { transform: translateX(-100%); }
    }
    </style>
    <div class="marquee-wrapper">
        <div class="marquee-border"></div>
        <div class="marquee">
            <div>AI IS TRANSFORMING THE FUTURE   ~   ARE YOU READY?</div>
        </div>
    </div>
    """, unsafe_allow_html=True
)

st.markdown(
    """
    <h3 style='text-align: center; color: #FFD700; margin-top: 20px; margin-bottom: 18px; padding: 0px; font-weight: bold; font-size: 38px; line-height: calc(38px * 1.5); letter-spacing: calc(38px * 0.02);'>
        <a href="https://machinelearningcoban.com/"NCKHSV17" style="color: #FFD700; text-decoration: none;">17TH STUDENT RESEARCH CONFERENCE</a>
    </h3>
    <h2 class="hover-effect" style='text-align: center; color: #003366; margin-top: 15px; margin-bottom: 30px; padding: 0px; font-weight: bold; font-size: 44px; line-height: calc(44px * 1.5); letter-spacing: calc(44px * 0.01); transition: font-size 0.3s ease, letter-spacing 0.3s ease;'>
        EARLY DETECTION OF AUTISM SPECTRUM DISORDER (ASD)
    </h2>
    <style>
        .hover-effect:hover {
            font-size: 46px !important;
            letter-spacing: calc(46px * 0.02) !important;
        }
    </style>
    """, unsafe_allow_html=True
)



st.markdown(
    """
    <div style='background-color: #E6F0FF; padding: 10px; border-radius: 10px; font-size: 18px; line-height: calc(18px * 1.5); letter-spacing: calc(18px * 0.02);'>
    <p style='color: #003366; line-height: calc(18px * 1.5); margin-bottom: calc(18px * 1); letter-spacing: calc(18px * 0.02);'>Eye Tracking for ASD    is an application that monitors users’ eye movements while they watch videos and leverages artificial intelligence to assess their risk of Autism Spectrum Disorder (ASD).</p>
    </div>
    """, unsafe_allow_html=True
)

st.markdown(
    """
    <style>
    .hover-container {
        text-align: center;
        background: linear-gradient(90deg, #003366 0%, #005580 30%, #0077AA 70%, #0099CC 100%);
        padding: 20px;
        border-radius: 10px;
        line-height: calc(24px * 1.5);
        letter-spacing: calc(24px * 0.02);
        position: relative;
        color: #FFD700;
        font-weight: bold;
        font-style: italic;
        font-size: 24px;
        transition: all 0.3s ease;
    }
    .emoji-container {
        display: inline;
    }
    .emoji {
        opacity: 0;
        display: inline-block;
        transform: translateX(-20px);
        transition: transform 0.5s ease, opacity 0.5s ease;
    }
    .hover-container:hover .emoji-1 {
        opacity: 1;
        transform: translateX(0);
        transition-delay: 0.2s;
    }
    .hover-container:hover .emoji-2 {
        opacity: 1;
        transform: translateX(0);
        transition-delay: 0.4s;
    }
    .hover-container:hover .emoji-3 {
        opacity: 1;
        transform: translateX(0);
        transition-delay: 0.6s;
    }
    </style>

    <div class="hover-container">
        GET READY TO EXPERIENCE THE INNOVATION OF TECHNOLOGY! 🤖 
        <span class="emoji-container">
            <span class="emoji emoji-1">💡 </span>
            <span class="emoji emoji-2">🚀</span>
            <span class="emoji emoji-3">🏆</span>
        </span>
    </div>
    """, unsafe_allow_html=True
)

st.markdown(
    """
    <div style='background-color: #E6F0FF; padding: 10px; border-radius: 10px; font-size: 18px; line-height: calc(18px * 1.5); letter-spacing: calc(18px * 0.02);'>
    <p style='color: #003366; margin-bottom: calc(18px * 1); letter-spacing: calc(18px * 0.02);'>Stay tuned for real time eye-tracking, patient data management, interactive diagnosis with scanpath visualization, and more...</p>
    </div>
    """, unsafe_allow_html=True
)

st.markdown(
    """
    <style>
    .gradient-divider {
        height: 3px;
        background: linear-gradient(90deg, #FFD700 0%, #FFBF00 50%, #FF9F00 100%);
        border: none;
        margin-top: 70px;
        margin-bottom: 0px;
    }
    </style>
    <div class="gradient-divider"></div>
    """, unsafe_allow_html=True
)

st.markdown(
    """
    <div style='position: absolute; bottom: 10px; right: 20px; text-align: right; color: #003366; font-size: 16px; font-weight: bold; line-height: calc(16px * 1.5); letter-spacing: calc(16px * 0.01);'>
            © Vnuis Student Conference. Our project code <a style='color: #FFD700;'>KH.NC.SV.24_25</a>
    </div>
    """, unsafe_allow_html=True
)
