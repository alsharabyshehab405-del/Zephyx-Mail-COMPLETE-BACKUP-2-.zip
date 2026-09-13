# تقرير Staging Capacity & Realistic Load Testing — Zephyx Mail

**تاريخ الفحص:** 26 أغسطس 2026

## 1. النطاق والمصدر

نُفذت هذه المرحلة على المصدر الرسمي فقط، دون تعديل `main` أو إنشاء فرع أو PR أو Commit أو Push:

| البند | القيمة |
|---|---|
| Repository | `alsharabyshehab405-del/Zephyx-Mail-Database-Tested-v2.zip` |
| Branch | `archive-source-work` |
| HEAD | `0133575727ed2a351cc7f712f32dbe84a5442ea0` |
| بيانات Production | لم تُستخدم |
| تغييرات الكود | لا توجد؛ التغيير التوثيقي الوحيد هو هذا التقرير |
| نمط الحمل | بيانات وحسابات اصطناعية، Staging محلي معزول |

القياسات الفعلية الواردة هنا لا تعني قدرة إنتاجية لمليون مستخدم. مستويات `100,000` و`1,000,000` مستخدم هي محاكاة آمنة bounded simulation، وليست إنشاء حسابات أو بيانات ضخمة فعلية.

## 2. بيئة الاختبار

استخدمت البيئة قاعدة PostgreSQL منفصلة وRedis منفصلًا على `127.0.0.1:6380` وSMTP sink محليًا على `127.0.0.1:1025`. شُغّل API على `127.0.0.1:3500`، وWeb على `127.0.0.1:3300`، مع Worker وScheduler مستقلين وqueue prefix خاص بـStaging.

| المكوّن | الحالة | ملاحظة القياس |
|---|---|---|
| PostgreSQL | PASS | قاعدة Staging مخصصة، pool metrics مفعلة، 22 migration مطبقة |
| Redis | PASS | instance محلي معزول، `PONG`، namespace خاص |
| API instances | PASS للتشغيل المحلي | instance واحد في القياس المباشر؛ multi-instance تحقق وظيفي لا benchmark إنتاجي |
| Web | PASS | Vite preview محلي |
| Worker | PASS | readiness marker موجود وWorker مستقل |
| Scheduler | PASS | readiness marker موجود وscheduler مستقل |
| SMTP | PASS للاختبار | sink محلي؛ لا outbound delivery |
| Object Storage | NOT_CONFIGURED | production bucket غير مهيأ؛ test storage فقط |
| ClamAV | NOT_CONFIGURED | fail-closed محفوظ، scanner حقيقي غير متاح |

## 3. منهجية القياس

استخدمت harness المحلي `scripts/scalability-load-test.mjs` مع target محلي فقط. يرفض harness أي مضيف غير محلي، ويضع حدودًا قصوى للطلبات والتزامن، لذلك لا يمكنه تنفيذ ضغط خارجي أو إنشاء مليون حساب فعلي بالخطأ.

يقيس harness زمن الجدار الفعلي لكل دفعة طلبات ويحسب `p50` و`p95` و`p99` وعدد الطلبات الناجحة والفاشلة. لا يُسمى هذا throughput إنتاجيًا إلا عندما تتوفر نافذة زمنية وقياس wall-clock للطلبات المكتملة. النتائج أدناه تخص endpoint health الخفيف، وليست workload كاملة للمصادقة والبريد والمرفقات.

## 4. Baseline وقياسات الحمل المرحلية

### 4.1 قياس baseline وhealth

نجحت فحوص baseline التشغيلية قبل الحمل:

| الفحص | النتيجة |
|---|---|
| API liveness | PASS، `{"status":"ok"}` |
| API readiness | PASS، PostgreSQL `ok` |
| API worker readiness | PASS، PostgreSQL وRedis `ok` |
| Web health | PASS |
| Redis ping | PASS |
| PostgreSQL readiness | PASS |
| Worker marker | present |
| Scheduler marker | present |
| SMTP sink | listening |

### 4.2 الحمل المرحلي المحدود

| المستوى | المستخدمون الافتراضيون | الطلبات الفعلية | التزامن | الناجح | الفاشل | p50 | p95 | p99 | زمن الجدار |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Baseline | 1 | 20 | 5 | 20 | 0 | قُيست في smoke فقط | قُيست في smoke فقط | قُيست في smoke فقط | smoke |
| 10k simulation | 10,000 | 500 | 50 | 500 | 0 | 18.74 ms | 45.10 ms | 240.31 ms | محفوظ في harness السابق |
| 100k simulation | 100,000 | 1,000 | 100 | 1,000 | 0 | 34.24 ms | 74.49 ms | 103.56 ms | محفوظ في harness السابق |
| 1m bounded simulation | 1,000,000 label | 2,000 | 100 | 2,000 | 0 | 32.66 ms | 66.89 ms | 80.44 ms | محفوظ في harness السابق |

هذه الأرقام صالحة كـ**health endpoint smoke measurements** فقط. لا تمثل throughput للبريد، ولا معدل إرسال، ولا سعة بحث، ولا عدد اتصالات SSE، ولا قدرة PostgreSQL على مليون مستخدم.

وبسبب أن harness يختبر endpoint health خفيفًا، لا أستنتج منه دعم تسجيل دخول أو Compose أو مرفقات أو بحث عند المستويات نفسها. قياس تلك المسارات يحتاج load generator مصادقًا وبيانات seed مضبوطة ووقت تشغيل أطول ومراقبة موارد خارجية.

## 5. المسارات الوظيفية المقاسة أو المتحققة

### 5.1 المصادقة والجلسات

نجحت Staging smoke flows الخاصة بـRegistration وLogin وSession Refresh. نجحت Playwright flows الكاملة التي تنشئ مستخدمين اصطناعيين وتصل إلى Inbox، كما نجحت API integration tests لعزل المستخدمين، refresh tokens، session revocation، وrate-limit behavior.

لم يُنفذ load واسع لتسجيل الدخول أو إنشاء ملايين الجلسات؛ تلك القياسات محكومة بمعدلات bcrypt وRedis/session stores وتحتاج workload منفصلة حتى لا تُخلط مع health smoke.

### 5.2 Inbox والبحث والفرز

نجحت Staging smoke في Inbox وFolders وSearch وfilters. نجحت اختبارات API للـcursor isolation والبحث Unicode والفلاتر، بما فيها sender/date/attachment/priority/task/folder. وغطت Playwright Smart Inbox وWorkspace search flows.

لم يُنفذ benchmark واسع على corpus بريد كبير؛ لذلك لا أبلغ عن p95 أو throughput إنتاجي للبحث والفرز. يجب إجراء ذلك على dataset اصطناعي ممثل لحجم mailbox الحقيقي قبل Beta عامة.

### 5.3 Compose وDraft وSend والردود

نجحت Draft creation وDraft autosave وSMTP test send عبر sink المحلي. كما نجحت Playwright flows لـCompose وReply وReply All وForward مع body مقتبس ومرفقات test storage، ونجحت API integration flows للإرسال والـthreading وidempotency.

لا يُعد SMTP sink دليلًا على قدرة relay خارجي، ولا تُعد رسائل الاختبار benchmark لشبكة البريد أو معدل التسليم. External SMTP بقي `NOT_CONFIGURED`.

### 5.4 المرفقات وObject Storage

اختبارات المرفقات تحققت من metadata validation وmagic bytes ورفض الصيغ غير الآمنة وownership boundaries. في Staging الحالي، attachment scanning وproduction Object Storage غير مهيأين. لذلك لم يُعلن عن benchmark رفع/قراءة مرفقات إنتاجية.

> **النتيجة:** لا يمكن اعتماد سعة مرفقات Beta عامة قبل توفير bucket مخصص وقياس streaming/access/delete وClamAV حقيقي. test memory storage ليس بديلًا عن Object Storage.

### 5.5 Workspace وTask/Event/Follow-up

نجحت Staging smoke وPlaywright وAPI integration في Workspace وTask وEvent وFollow-up وsnooze وcompletion وreconciliation بعد الرد. نجحت ownership checks ومنع الوصول عبر المستخدمين.

لم يُشغّل حمل واسع على عمليات إنشاء المهام والأحداث والمتابعات؛ النتائج الحالية وظيفية وليست capacity benchmark.

## 6. SSE/realtime وRedis وBullMQ

نجحت اختبارات SSE cross-replica الوظيفية في named events والعزل وbounded replay واستهلاك tickets مرة واحدة. نجحت Redis realtime smoke وone-time ticket. كما نجحت اختبارات Worker وScheduler وOutbox وidempotency وlease recovery.

| المجال | نتيجة هذا الفحص | حدود الاستنتاج |
|---|---|---|
| Redis connectivity | PASS | ping وتشغيل realtime وBullMQ محليًا |
| Redis memory/commands | لم يُجرَ benchmark طويل | لا تتوفر أرقام production memory أو commands/sec |
| BullMQ worker | PASS وظيفيًا | لا توجد سعة queue production مثبتة |
| Scheduler reservation | PASS وظيفيًا | لا يوجد benchmark publish fan-out طويل |
| SSE multi-instance | PASS وظيفيًا | لا يوجد benchmark لآلاف الاتصالات المستمرة |
| Queue depth | readiness/metrics متاحة | لم تُسجل series زمنية طويلة تحت حمل بريد حقيقي |
| Worker failures | failure/retry/idempotency tests PASS | لم يُقَس failure rate تحت ضغط مستمر |

تم استخدام per-user Redis stream وbounded replay في المصدر الحالي، لكن ذلك لا يغني عن Redis HA وconnection limits وmemory policy وmulti-instance load test قبل 100k أو مليون مستخدم.

## 7. PostgreSQL pool والاستعلامات والفهارس

نجحت migrations من قاعدة فارغة، ونجحت اختبارات الفهارس وoutbox concurrency وcursor isolation. يعرض API metrics عدد pool connections وidle connections وwaiting requests. كما اختبرت integration suites ownership وsearch filters وidempotency وlease recovery.

لم يُنفذ `pgbench` أو workload query benchmark كبير في هذه الجولة؛ لذلك لا توجد أرقام صادقة لـslow-query rate أو IOPS أو CPU PostgreSQL تحت 100k مستخدم. الفهارس الحالية تحسن المسارات المستهدفة، لكنها لا تثبت سعة إنتاجية منفردة.

| القياس المطلوب | حالة هذا الفحص |
|---|---|
| Pool total/idle/waiting gauges | متاحة وظهرت في `/api/metrics` |
| Slow query log/rate | غير مقاس على workload طويل |
| Query latency لكل endpoint | غير مقاس على dataset كبير |
| DB CPU/RAM/IOPS | غير متاح كقياس production في sandbox |
| Read replica behavior | غير منفذ |
| Connection pooler behavior | غير منفذ |
| Partitioning/sharding | غير منفذ وغير مبرر بالقياسات الحالية |

## 8. Multi-tenant isolation وRate Limits وIdempotency

نجحت اختبارات API وIntegration الخاصة بعزل المستخدم والملكية وعزل الحسابات والحفاظ على عدم تسرب الرسائل. كما نجحت Enterprise foundation tests لعزل organization workflows. Redis realtime channels والstreams مخصصة للمستخدم، ولم يظهر تسريب في cross-replica tests.

نجح rate-limit smoke عمليًا وظهرت `RateLimit-Limit` headers. نجحت اختبارات HTTP rate limiting وidempotency concurrency، بما فيها منع duplicate Email وduplicate Outbox job وإعادة response المتطابق.

هذه نتائج correctness وsafety، وليست proof أن limits الحالية كافية لـ100k أو مليون مستخدم. يلزم توزيع rate-limit state ومراقبة saturation عبر عدة API instances قبل التوسع.

## 9. ClamAV fail-closed وThreat Protection

تم تشغيل والتحقق من Threat Protection v1 دون تعديل. نجحت تحليلات phishing وcredential lures وحالات SPF/DKIM/DMARC وتقارير التهديدات وownership checks.

ClamAV الحقيقي غير مهيأ في Staging، لكن fail-closed بقي محفوظًا: attachment flows لا تُعتبر قابلة للتسليم عند غياب scanner. لم تُستخدم أسرار أو خدمة antivirus إنتاجية، ولا ينبغي تفسير `NOT_CONFIGURED` على أنه نجاح scanning.

## 10. CPU وRAM وthroughput وerror rate

تم تسجيل error rate للحمل المحدود على health endpoint كالتالي:

| المستوى | Error rate | Throughput قابل للتقرير |
|---|---:|---|
| Baseline | 0% | غير مُعلن؛ baseline smoke |
| 10k label | 0% (500/500) | غير مُعلن كـproduction throughput |
| 100k label | 0% (1,000/1,000) | غير مُعلن كـproduction throughput |
| 1m label | 0% (2,000/2,000) | غير مُعلن كـproduction throughput |

لم تتوفر في هذه الجولة عدادات موثوقة لعينة زمنية كاملة لـCPU وRAM وRedis memory وPostgreSQL IOPS وqueue depth أثناء كل دفعة. metrics التطبيق وpool وqueue موجودة، لكن لا يجوز اختراع أرقام system resource غير مقاسة.

بالتالي، **نقطة الاختناق الفعلية المثبتة في هذه الجولة ليست CPU أو RAM**. ما ثبت فعليًا هو حد القياس: الحمل كان health-only ومحدودًا، ولذلك لم يصل إلى workload البريد التي قد تكشف اختناق PostgreSQL أو SMTP أو Object Storage أو SSE.

## 11. الحد الآمن الحالي

الحد الآمن الذي يمكن دعمه بهذا الفحص هو **Staging smoke وfunctional concurrency محلية، مع 10k مستخدم افتراضي كـbounded health simulation فقط**. لا أصف ذلك بأنه دعم 10k مستخدمين إنتاجيين مصادقين.

النسخة تدعم وظيفيًا المسارات الأساسية عند الاستخدام المحدود، مع pool مضبوط وفهارس وRedis isolation وWorker/Scheduler وidempotency وreadiness metrics. لكن لا توجد دلائل workload كافية لتحديد RPS آمن للبريد أو عدد اتصالات SSE أو معدل إرسال مرفقات.

## 12. هل يدعم 10,000 مستخدم؟

**الإجابة الدقيقة: يدعم 10k simulation المحدود على health endpoint فقط، وليس 10k مستخدمين إنتاجيين كاملين مثبتين بالحمل.** قبل إعلان دعم 10k فعليًا يجب تشغيل عدة API instances، وRedis وPostgreSQL مراقبين، وحمل مصادق موزع يغطي Inbox/search/Compose/send/Workspace/SSE، مع dataset اصطناعي ممثل وSMTP/Object Storage/ClamAV Staging حقيقيين أو موثقين.

## 13. ما يلزم لـ100,000 مستخدم؟

| المتطلب | السبب |
|---|---|
| عدة API instances خلف load balancer | إزالة نقطة الفشل الوحيدة وتوزيع HTTP/SSE |
| PostgreSQL capacity plan وpooler | منع استنزاف الاتصالات وقياس CPU/IOPS/slow queries |
| read replicas أو فصل قراءات مدروس | تخفيف Inbox/search/workspace reads بعد إثبات الحاجة |
| partition/retention plan للبريد وoutbox | إبقاء الفهارس والـcursor queries قابلة للإدارة |
| Redis HA وmemory policy وconnection limits | استمرار realtime والlimits وBullMQ دون نقطة فشل واحدة |
| worker pools منفصلة للأعمال الثقيلة | منع إرسال البريد/المرفقات/التقارير من خنق API |
| Object Storage + CDN + streaming | منع full-buffer memory pressure وتوفير delivery قابل للتوسع |
| ClamAV scanning fleet | فحص المرفقات بموارد منفصلة وبـfail-closed |
| observability مركزية | تجميع metrics/logs وqueue depth وSSE وfailure rates عبر instances |
| load test موزع | قياس RPS وlatency وerror budget على traffic ممثل |

لا تُنفذ sharding أو Kafka تلقائيًا؛ تُتخذ هذه القرارات فقط بعد قياسات workload وcapacity تثبت الحاجة.

## 14. ما يلزم للمليون مستخدم؟

المليون ليس مجرد رفع `concurrency` في هذا harness. يلزم تصميم capacity متعدد المناطق أو متعدد الخلايا، إدارة جلسات وrate limits موزعة، Redis HA وربما partitioning للتدفقات، PostgreSQL partitioning أو sharding فقط إذا أثبتت القياسات أنه ضروري، queue infrastructure متعددة الأحواض، Object Storage وCDN عالميان، ClamAV fleet، edge TLS/CORS/trusted-proxy topology، disaster recovery، وload tests موزعة ببيانات اصطناعية كبيرة.

ينبغي أن تسبق أي قرار Kafka أو sharding أرقام فعلية عن saturation وqueue lag وDB IOPS وslow queries وSSE connection counts وfailure recovery. لم تُثبت هذه الجولة ضرورة أي منها.

## 15. الخدمات `NOT_CONFIGURED`

| الخدمة | الحالة | أثرها على capacity |
|---|---|---|
| Production Object Storage | NOT_CONFIGURED | لا يوجد benchmark تخزين مرفقات دائم |
| ClamAV runtime | NOT_CONFIGURED | scanning الحقيقي غير مقاس؛ fail-closed محفوظ |
| External SMTP | NOT_CONFIGURED | لا يوجد benchmark relay أو delivery rate |
| Gmail OAuth | NOT_CONFIGURED | لا يوجد sync load خارجي |
| Outlook/Graph | NOT_CONFIGURED | لا يوجد sync load خارجي |
| FCM | NOT_CONFIGURED | push delivery غير مقاس |
| Web Push | NOT_CONFIGURED | VAPID delivery غير مقاس |
| Billing | NOT_CONFIGURED | payment/webhook load غير مقاس |
| AI provider | NOT_CONFIGURED | لا توجد ميزات AI أو agents وهمية |
| Mailpit UI | NOT_CONFIGURED | استُخدم SMTP sink محلي |
| Public Caddy/TLS | NOT_CONFIGURED | لا DNS/ACME/edge runtime عام |

## 16. Blockers

1. **لا توجد workload measurements حقيقية لمسارات البريد الثقيلة**؛ لذلك لا يمكن اعتماد RPS أو عدد مستخدمين إنتاجيين عند 10k أو 100k.
2. **Object Storage وClamAV غير مهيأين**؛ اختبار المرفقات الإنتاجي مؤجل، مع بقاء fail-closed.
3. **لا توجد PostgreSQL/Redis resource series** كافية لـCPU/RAM/IOPS/slow queries/commands per second تحت حمل طويل.
4. **لا يوجد benchmark موزع لعدة API instances واتصالات SSE كبيرة**؛ cross-replica تحقق وظيفي فقط.
5. **Caddy/TLS العام غير متاح**؛ Docker وDNS وACME وruntime Caddy 2.9 لم تُشغل في sandbox.
6. **Flutter APK release غير مثبت** لأن Android SDK غير متوفر؛ Flutter tests نجحت `69/69`، لكن ذلك لا يثبت artifact native.
7. **Flutter Web release غير مثبت** لأن المشروع غير مهيأ لمنصة Web.
8. **الخدمات الخارجية بقيت `NOT_CONFIGURED`**، فلا يجوز إعلان جاهزية تكاملاتها.

## 17. الخلاصة

النتيجة الحالية هي **Readiness مشروط لـStaging وPrivate Beta محدودة**، وليست شهادة capacity production. ثبتت هذه الجولة سلامة التشغيل الوظيفي، العزل، readiness، pool/index controls، Redis realtime، Worker/Scheduler، rate limits، idempotency، وfail-closed security، كما أظهرت أن bounded health simulations عند labels 10k و100k و1m نجحت دون أخطاء.

لكن **نقطة الاختناق الفعلية لم تُثبت بعد** لأن الحمل لم يكن workload كاملة للمصادقة والبريد والبحث والمرفقات وSSE. لذلك الحد الآمن المعلن هو Staging/Private Beta محدودة فقط، مع ضرورة تنفيذ distributed authenticated load وresource monitoring قبل أي ادعاء دعم 100k أو مليون مستخدم.

## 18. حالة Git

لم يُنشأ Commit ولم يُنفذ Push ولم يتغير `main`. بعد تنظيف artifacts المولدة، التغيير المقصود هو:

```text
M docs/BETA_READINESS_REPORT.md
?? docs/STAGING_CAPACITY_LOAD_REPORT.md
```

أما `.env.staging` وdist وSBOM وFlutter build وPlaywright reports فهي artifacts محلية أو ignored، وليست جزءًا من التسليم أو البيانات الإنتاجية.
