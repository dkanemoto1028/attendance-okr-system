// Translations for dynamic data content (OKR objectives, KR titles, AI insights, etc.)
// Base language is Japanese (stored in mock-data). This file provides other languages.

type T = Partial<Record<string, string>>; // lang -> translated string

export const okrObjectiveI18n: Record<string, T> = {
  "okr-company-q2": {
    en: "Improve global organization health and productivity",
    ko: "글로벌 조직의 건전성과 생산성 향상",
    vi: "Nâng cao sức khỏe tổ chức và năng suất toàn cầu",
    zh: "提升全球组织健康度与生产力",
    es: "Mejorar la salud organizacional y la productividad global",
  },
  "okr-eng-q2": {
    en: "Raise quality at a sustainable development pace",
    ko: "지속 가능한 속도로 개발 품질 향상",
    vi: "Nâng cao chất lượng với tốc độ phát triển bền vững",
    zh: "以可持续的节奏提升开发质量",
    es: "Mejorar la calidad a un ritmo de desarrollo sostenible",
  },
  "okr-e1-q2": {
    en: "Contribute to team development productivity as tech lead",
    ko: "테크 리드로서 팀 개발 생산성에 기여",
    vi: "Đóng góp vào năng suất phát triển nhóm với tư cách tech lead",
    zh: "作为技术负责人提升团队开发生产力",
    es: "Contribuir a la productividad del equipo como tech lead",
  },
  "okr-e2-q2": {
    en: "Increase product value through new feature releases",
    ko: "새 기능 출시를 통한 제품 가치 향상",
    vi: "Tăng giá trị sản phẩm thông qua các tính năng mới",
    zh: "通过发布新功能提升产品价值",
    es: "Aumentar el valor del producto mediante nuevas funcionalidades",
  },
};

export const krTitleI18n: Record<string, T> = {
  kr1: { en: "Global leave usage rate ≥ 60%", ko: "전 거점 유급 사용률 60% 이상", vi: "Tỷ lệ nghỉ phép ≥ 60% toàn cầu", zh: "全球年假使用率 ≥ 60%", es: "Tasa de uso de vacaciones global ≥ 60%" },
  kr2: { en: "Avg monthly overtime ≤ 25h", ko: "월평균 잔업 25시간 이하", vi: "Trung bình tăng ca ≤ 25h/tháng", zh: "月均加班 ≤ 25小时", es: "Horas extra mensuales promedio ≤ 25h" },
  kr3: { en: "Attendance system adoption ≥ 95% globally", ko: "전 거점 근태 시스템 이용률 95% 이상", vi: "Tỷ lệ sử dụng hệ thống ≥ 95% toàn cầu", zh: "全球考勤系统使用率 ≥ 95%", es: "Adopción del sistema ≥ 95% globalmente" },
  kr4: { en: "Weekly avg overtime ≤ 5h", ko: "주평균 잔업 5시간 이하", vi: "Tăng ca trung bình ≤ 5h/tuần", zh: "周均加班 ≤ 5小时", es: "Promedio semanal de horas extra ≤ 5h" },
  kr5: { en: "1-on-1 completion rate 100%", ko: "1on1 실시율 100%", vi: "Tỷ lệ hoàn thành 1-on-1 100%", zh: "一对一会议完成率 100%", es: "Tasa de 1-on-1 completados 100%" },
  kr6: { en: "Sprint completion rate ≥ 90%", ko: "스프린트 완료율 90% 이상", vi: "Tỷ lệ hoàn thành sprint ≥ 90%", zh: "Sprint 完成率 ≥ 90%", es: "Tasa de completado de sprint ≥ 90%" },
  kr7: { en: "Secure 3h/week for code review", ko: "코드 리뷰 주 3시간 확보", vi: "Dành ≥ 3h/tuần cho code review", zh: "每周代码审查时间 ≥ 3小时", es: "Asegurar 3h/semana para revisión de código" },
  kr8: { en: "Take ≥ 5 days annual leave", ko: "연차 5일 이상 취득", vi: "Nghỉ phép ≥ 5 ngày/năm", zh: "年假使用 ≥ 5天", es: "Tomar ≥ 5 días de vacaciones" },
  kr9: { en: "Host 2 tech study sessions/month", ko: "월 2회 기술 스터디 개최", vi: "Tổ chức 2 buổi học kỹ thuật/tháng", zh: "每月举办 2 次技术分享会", es: "Organizar 2 sesiones técnicas al mes" },
  kr10: { en: "Monthly overtime ≤ 20h", ko: "월 잔업 20시간 이하", vi: "Tăng ca ≤ 20h/tháng", zh: "月加班 ≤ 20小时", es: "Horas extra mensuales ≤ 20h" },
  kr11: { en: "Bug fix rate ≥ 90%", ko: "버그 수정율 90% 이상", vi: "Tỷ lệ sửa lỗi ≥ 90%", zh: "Bug 修复率 ≥ 90%", es: "Tasa de corrección de bugs ≥ 90%" },
  kr12: { en: "Take ≥ 3 days annual leave", ko: "연차 3일 이상 취득", vi: "Nghỉ phép ≥ 3 ngày", zh: "年假使用 ≥ 3天", es: "Tomar ≥ 3 días de vacaciones" },
};

export const aiInsightI18n: Record<string, { message: T; actionLabel: T }> = {
  e2: {
    message: {
      en: "Yamada's overtime this month is 42h, up +35% from last month. Far exceeding OKR target (≤20h) — recommend a 1-on-1 to check on their condition.",
      ko: "야마다의 이번 달 잔업이 42시간으로 지난달 대비 +35% 증가했습니다. OKR 목표(20시간 이하)를 크게 초과 중 — 컨디션 확인을 위한 1on1을 권장합니다.",
      vi: "Tăng ca của Yamada tháng này là 42h, tăng +35% so với tháng trước. Vượt xa mục tiêu OKR (≤20h) — đề nghị gặp 1-on-1 để kiểm tra tình trạng.",
      zh: "山田本月加班42小时，比上月增加+35%。已大幅超出OKR目标（≤20h），建议通过1on1了解其状态。",
      es: "El tiempo extra de Yamada este mes es 42h, un +35% más que el pasado. Supera el objetivo OKR (≤20h) — se recomienda un 1-on-1.",
    },
    actionLabel: {
      en: "Schedule 1-on-1 →", ko: "1on1 예약하기 →", vi: "Lên lịch 1-on-1 →", zh: "安排1on1 →", es: "Programar 1-on-1 →",
    },
  },
  e6: {
    message: {
      en: "Li Ming's leave usage remains critically low (1 of 10 days taken). Potential non-compliance with Chinese labor law minimum requirements.",
      ko: "리밍의 유급 사용이 매우 낮은 상태입니다 (10일 중 1일 취득). 중국 노동법 최저 기준 위반 가능성이 있습니다.",
      vi: "Tỷ lệ nghỉ phép của Li Ming rất thấp (1/10 ngày). Có thể không tuân thủ quy định tối thiểu của luật lao động Trung Quốc.",
      zh: "李明的年假使用率极低（已用1天/上限10天）。可能与中国劳动法最低标准存在差距，需要确认。",
      es: "El uso de vacaciones de Li Ming es muy bajo (1 de 10 días usados). Posible incumplimiento de los requisitos mínimos de la ley laboral china.",
    },
    actionLabel: {
      en: "Encourage leave →", ko: "휴가 촉진하기 →", vi: "Khuyến khích nghỉ phép →", zh: "促进休假 →", es: "Fomentar vacaciones →",
    },
  },
  e1: {
    message: {
      en: "Tanaka's OKR progress is strong. Overtime is only 8h and within healthy range — great balance between output and wellbeing.",
      ko: "다나카의 OKR 달성률이 양호합니다. 잔업도 8시간으로 적정 범위 내 — 성과와 컨디션의 균형이 잘 잡혀 있습니다.",
      vi: "Tiến độ OKR của Tanaka rất tốt. Tăng ca chỉ 8h trong phạm vi lành mạnh — cân bằng tốt giữa hiệu suất và sức khỏe.",
      zh: "田中的OKR完成率良好。加班也只有8小时，处于合理范围内——绩效与状态之间保持了良好平衡。",
      es: "El progreso OKR de Tanaka es sólido. Las horas extra son solo 8h dentro del rango saludable — buen equilibrio entre rendimiento y bienestar.",
    },
    actionLabel: {
      en: "View details →", ko: "자세히 보기 →", vi: "Xem chi tiết →", zh: "查看详情 →", es: "Ver detalles →",
    },
  },
};

export const complianceAlertI18n: Record<string, T> = {
  KR: {
    en: "Possible violation of the 52-hour weekly limit → 3 employees affected. Compliance with Korean labor law required.",
    ko: "주 52시간 초과 가능성 → 3명 해당. 한국 근로기준법 준수가 필요합니다.",
    vi: "Có thể vi phạm giới hạn 52h/tuần → 3 nhân viên bị ảnh hưởng. Cần tuân thủ luật lao động Hàn Quốc.",
    zh: "可能超过每周52小时上限 → 3名员工受影响。需遵守韩国劳动法。",
    es: "Posible superación del límite de 52h semanales → 3 empleados afectados. Se requiere cumplir la ley laboral coreana.",
  },
  CN: {
    en: "Annual leave usage rate may fall below the legal minimum (currently 38% / recommended minimum 40%).",
    ko: "연차 사용률이 법정 기준 이하일 가능성이 있습니다 (현재 38% / 최저 40% 기준).",
    vi: "Tỷ lệ sử dụng phép năm có thể thấp hơn mức pháp lý tối thiểu (hiện tại 38% / tối thiểu đề nghị 40%).",
    zh: "年假使用率可能低于法定最低标准（当前38% / 建议最低40%）。",
    es: "La tasa de uso de vacaciones puede estar por debajo del mínimo legal (actual 38% / mínimo recomendado 40%).",
  },
};

export const globalAiCardI18n: { title: T; desc: T; action: T }[] = [
  {
    title: {
      en: "Hiring Recommended", ko: "채용 권장", vi: "Đề nghị tuyển dụng", zh: "建议招聘", es: "Contratación recomendada",
    },
    desc: {
      en: "Korean engineering team OKR achievement is low (62%) despite high overtime (31h), suggesting understaffing. Recommend hiring ~2 engineers.",
      ko: "한국 엔지니어링팀의 OKR 달성률이 낮은(62%) 반면 잔업시간은 높습니다(31h). 인력 부족 가능성이 높아 2명 정도 채용을 권장합니다.",
      vi: "Tỷ lệ đạt OKR của nhóm kỹ thuật Hàn Quốc thấp (62%) dù tăng ca cao (31h), gợi ý thiếu nhân lực. Đề nghị tuyển ~2 kỹ sư.",
      zh: "韩国工程团队OKR达成率低（62%）但加班时间高（31h），可能人手不足。建议招聘约2名工程师。",
      es: "El equipo de ingeniería de Corea tiene bajo logro OKR (62%) con muchas horas extra (31h), sugiriendo falta de personal. Se recomienda contratar ~2 ingenieros.",
    },
    action: {
      en: "View hiring plan", ko: "채용 계획 보기", vi: "Xem kế hoạch tuyển dụng", zh: "查看招聘计划", es: "Ver plan de contratación",
    },
  },
  {
    title: {
      en: "Promote Leave Usage", ko: "휴가 취득 촉진", vi: "Khuyến khích nghỉ phép", zh: "促进休假", es: "Fomentar el uso de vacaciones",
    },
    desc: {
      en: "China office leave usage is low at 38%. Target 50% by end of Q3 — strengthen manager-led recommendations to take leave.",
      ko: "중국 거점의 휴가 소화율이 38%로 낮습니다. Q3 말까지 50% 달성을 목표로 관리자에 의한 취득 권장을 강화해 주세요.",
      vi: "Tỷ lệ sử dụng phép của văn phòng Trung Quốc thấp ở mức 38%. Mục tiêu đạt 50% vào cuối Q3 — tăng cường khuyến nghị từ quản lý.",
      zh: "中国办公室年假使用率仅38%，偏低。目标Q3末达到50%——请加强管理者的休假建议力度。",
      es: "El uso de vacaciones en China es bajo (38%). Meta: 50% para fin de Q3 — reforzar las recomendaciones de gerentes para tomar descansos.",
    },
    action: {
      en: "Send message", ko: "메시지 보내기", vi: "Gửi tin nhắn", zh: "发送消息", es: "Enviar mensaje",
    },
  },
  {
    title: {
      en: "Share Best Practices", ko: "모범 사례 공유", vi: "Chia sẻ thực hành tốt nhất", zh: "分享最佳实践", es: "Compartir buenas prácticas",
    },
    desc: {
      en: "Colombia office has 78% leave usage, lowest overtime, and highest OKR achievement. Recommend spreading their working-style knowledge to other offices.",
      ko: "콜롬비아 거점은 휴가 소화율 78%·최소 잔업·최고 OKR 달성률을 기록 중입니다. 근무 방식 노하우를 다른 거점에 공유할 것을 권장합니다.",
      vi: "Văn phòng Colombia có tỷ lệ nghỉ phép 78%, tăng ca ít nhất và OKR cao nhất. Đề nghị chia sẻ cách làm việc của họ cho các văn phòng khác.",
      zh: "哥伦比亚办公室年假使用率78%、加班最少、OKR达成率最高。建议将其工作方式的经验推广到其他办公室。",
      es: "La oficina de Colombia tiene 78% de uso de vacaciones, menos horas extra y mayor logro OKR. Se recomienda compartir sus prácticas de trabajo con otras sedes.",
    },
    action: {
      en: "View case study", ko: "사례 확인하기", vi: "Xem case study", zh: "查看案例", es: "Ver caso de estudio",
    },
  },
];
