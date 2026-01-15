import streamlit as st
import google.generativeai as genai

# 1. 지도사님의 API 키 설정
genai.configure(api_key="AIzaSyA_lfKfrAtlv_DLXrjR1LPDtwv8UIgIcjw")
model = genai.GenerativeModel('gemini-1.5-flash')

# 2. 웹 화면 디자인 (대표님이 보게 될 화면)
st.set_page_config(page_title="LogiTrust MVP", page_icon="🚚")

st.title("🚚 LogiTrust : 운송지 리스크 가이드")
st.info("초보 기사님의 안전한 운송을 위해 AI가 현장 정보를 분석합니다.")

# 대표님이 입력할 칸
target_place = st.text_input("운송지 주소 또는 상호명을 입력하세요", placeholder="예: 경기도 성남시 분당구 OO물류센터")

if st.button("현장 리스크 분석 시작"):
    if target_place:
        with st.spinner('실시간 데이터를 분석 중입니다...'):
            # 지도사님이 AI 스튜디오에서 설계하신 전문가적 분석 요청
            prompt = f"너는 물류 전문가야. 운송 기사를 위해 '{target_place}'의 진입로 주의사항, 상하차 위치, 대기시간 리스크를 상세히 알려줘."
            response = model.generate_content(prompt)
            
            st.subheader(f"📍 {target_place} 분석 결과")
            st.markdown(response.text)
            st.divider()
            st.caption("제공되는 정보는 AI 분석 결과이며 실무 데이터 보완이 필요합니다.")
    else:
        st.warning("분석할 장소를 입력해 주세요.")
