## ─── Config ───────────────────────────────────────────────────────────────
$BASE = "https://taskflow-production-c28b.up.railway.app/api"

function Post($url, $body, $token=$null) {
    $h = @{ "Content-Type" = "application/json" }
    if ($token) { $h["Authorization"] = "Bearer $token" }
    try {
        $r = Invoke-WebRequest -Uri $url -Method POST -Body ($body | ConvertTo-Json -Depth 5) -Headers $h -UseBasicParsing
        return ($r.Content | ConvertFrom-Json).data
    } catch {
        $msg = $_.Exception.Response.GetResponseStream()
        $rd  = New-Object System.IO.StreamReader($msg)
        Write-Warning "POST $url -> $($rd.ReadToEnd())"
        return $null
    }
}

## ─── Login as admin ───────────────────────────────────────────────────────
Write-Host "`n[1] Logging in as admin..." -ForegroundColor Cyan
$auth  = Post "$BASE/auth/login" @{ email="admin@test.com"; password="Admin@123" }
$token = $auth.accessToken
Write-Host "    Token obtained: $($token.Substring(0,20))..."

## ─── Register 5 new members ───────────────────────────────────────────────
Write-Host "`n[2] Registering new members..." -ForegroundColor Cyan
$newUsers = @(
    @{ name="Carol Williams"; email="carol@test.com";   password="Member@123"; role="MEMBER" },
    @{ name="David Lee";      email="david@test.com";   password="Member@123"; role="MEMBER" },
    @{ name="Eva Martinez";   email="eva@test.com";     password="Member@123"; role="MEMBER" },
    @{ name="Frank Chen";     email="frank@test.com";   password="Member@123"; role="MEMBER" },
    @{ name="Grace Kim";      email="grace@test.com";   password="Member@123"; role="MEMBER" }
)

$regUsers = @{}
foreach ($u in $newUsers) {
    $res = Post "$BASE/auth/register" $u $token
    if ($res) {
        Write-Host "    + Registered: $($u.name) [$($u.email)]" -ForegroundColor Green
        # Store by first name for later lookup
        $firstName = $u.name.Split(" ")[0]
        $regUsers[$firstName] = $res
    }
}

## ─── Get all users to get IDs ─────────────────────────────────────────────
Write-Host "`n[3] Fetching all users..." -ForegroundColor Cyan
$h = @{ Authorization="Bearer $token" }
$usersResp = Invoke-WebRequest -Uri "$BASE/users" -Headers $h -UseBasicParsing
$allUsers  = (($usersResp.Content | ConvertFrom-Json).data.content)
$userMap   = @{}
foreach ($u in $allUsers) { $userMap[$u.name] = $u.id }
Write-Host "    Users in DB: $($allUsers.Count)"
$allUsers | ForEach-Object { Write-Host "    - ID $($_.id): $($_.name)" }

## ─── Create 4 new projects ────────────────────────────────────────────────
Write-Host "`n[4] Creating projects..." -ForegroundColor Cyan

function NewProject($name, $desc, $status="ACTIVE") {
    $body = @{ name=$name; description=$desc; status=$status }
    $h2   = @{ "Content-Type"="application/json"; Authorization="Bearer $token" }
    $r    = Invoke-WebRequest -Uri "$BASE/projects" -Method POST -Body ($body|ConvertTo-Json) -Headers $h2 -UseBasicParsing
    $p    = ($r.Content | ConvertFrom-Json).data
    Write-Host "    + Project '$($p.name)' [ID $($p.id)]" -ForegroundColor Green
    return $p
}

function AddMember($projectId, $userId) {
    $h2 = @{ "Content-Type"="application/json"; Authorization="Bearer $token" }
    try { Invoke-WebRequest -Uri "$BASE/projects/$projectId/members" -Method POST -Body (@{userId=$userId}|ConvertTo-Json) -Headers $h2 -UseBasicParsing | Out-Null } catch {}
}

$p3 = NewProject "E-Commerce Platform"   "Build a scalable e-commerce platform with cart, checkout, and inventory management"
$p4 = NewProject "Data Analytics Dashboard" "Real-time analytics dashboard with charts, KPIs, and export features"
$p5 = NewProject "API Gateway Microservice" "Design and implement an API gateway for the microservices architecture" "ACTIVE"
$p6 = NewProject "DevOps Automation"     "Automate deployment, monitoring, and scaling for all production services" "ARCHIVED"

# Add members to projects
foreach ($uid in @($userMap["Alice Johnson"], $userMap["Carol Williams"], $userMap["David Lee"])) {
    if ($uid) { AddMember $p3.id $uid }
}
foreach ($uid in @($userMap["Bob Smith"], $userMap["Eva Martinez"], $userMap["Frank Chen"])) {
    if ($uid) { AddMember $p4.id $uid }
}
foreach ($uid in @($userMap["Grace Kim"], $userMap["David Lee"], $userMap["Alice Johnson"])) {
    if ($uid) { AddMember $p5.id $uid }
}
foreach ($uid in @($userMap["Bob Smith"], $userMap["Carol Williams"])) {
    if ($uid) { AddMember $p6.id $uid }
}
Write-Host "    Members added to all projects."

## ─── Create tasks ─────────────────────────────────────────────────────────
Write-Host "`n[5] Creating tasks..." -ForegroundColor Cyan

function NewTask($projectId, $title, $desc, $status, $priority, $dueDays, $assigneeName) {
    $assigneeId = $userMap[$assigneeName]
    $dueDate    = (Get-Date).AddDays($dueDays).ToString("yyyy-MM-dd")
    $body = @{
        title       = $title
        description = $desc
        status      = $status
        priority    = $priority
        dueDate     = $dueDate
        assigneeId  = $assigneeId
    }
    $h2 = @{ "Content-Type"="application/json"; Authorization="Bearer $token" }
    try {
        $r = Invoke-WebRequest -Uri "$BASE/projects/$projectId/tasks" -Method POST -Body ($body|ConvertTo-Json) -Headers $h2 -UseBasicParsing
        $t = ($r.Content | ConvertFrom-Json).data
        Write-Host "      [$status] $title -> $assigneeName" -ForegroundColor DarkGray
    } catch {
        Write-Warning "Failed to create task: $title"
    }
}

# ── E-Commerce Platform tasks ──
Write-Host "  Project: E-Commerce Platform" -ForegroundColor Yellow
NewTask $p3.id "Design product catalog UI"        "Create Figma designs for product listing and detail pages"         "DONE"        "HIGH"   -14 "Alice Johnson"
NewTask $p3.id "Implement cart service"           "Build add-to-cart, update quantity, and remove item APIs"           "DONE"        "HIGH"   -7  "Carol Williams"
NewTask $p3.id "Payment gateway integration"      "Integrate Stripe for secure checkout and refund processing"         "IN_PROGRESS" "HIGH"   5   "David Lee"
NewTask $p3.id "Inventory management module"      "Track stock levels, set low-stock alerts, and batch update support" "IN_PROGRESS" "MEDIUM" 10  "Alice Johnson"
NewTask $p3.id "Order history & tracking"         "Allow users to view past orders and live shipment tracking"         "TODO"        "MEDIUM" 18  "Carol Williams"
NewTask $p3.id "Product search & filters"         "Implement Elasticsearch-based search with category and price filters" "TODO"      "HIGH"   21  "David Lee"
NewTask $p3.id "Write e2e checkout tests"         "Cover full checkout flow with Playwright tests"                    "TODO"        "LOW"    28  "Carol Williams"
NewTask $p3.id "SEO & meta tags optimization"     "Add dynamic meta tags and structured data for product pages"        "TODO"        "LOW"    35  "Alice Johnson"

# ── Data Analytics Dashboard tasks ──
Write-Host "  Project: Data Analytics Dashboard" -ForegroundColor Yellow
NewTask $p4.id "Set up data warehouse"            "Configure BigQuery tables and ingestion pipelines"                  "DONE"        "HIGH"   -10 "Bob Smith"
NewTask $p4.id "Build KPI summary cards"          "Revenue, DAU, conversion rate, and churn widgets"                  "DONE"        "MEDIUM" -5  "Eva Martinez"
NewTask $p4.id "Implement line chart component"   "Interactive time-series chart with zoom and tooltip support"        "DONE"        "HIGH"   -2  "Frank Chen"
NewTask $p4.id "Add date range picker"            "Allow filtering all charts by custom date ranges"                   "IN_PROGRESS" "MEDIUM" 4   "Eva Martinez"
NewTask $p4.id "Export to CSV & PDF"              "Let users download filtered report data in multiple formats"        "IN_PROGRESS" "LOW"    8   "Bob Smith"
NewTask $p4.id "Real-time data streaming"         "Connect WebSocket feed for live metric updates"                    "TODO"        "HIGH"   14  "Frank Chen"
NewTask $p4.id "Role-based report access"         "Restrict sensitive financial reports to manager role only"          "TODO"        "MEDIUM" 20  "Eva Martinez"
NewTask $p4.id "Dashboard sharing & embeds"       "Generate shareable public links and iframe embed codes"             "TODO"        "LOW"    30  "Bob Smith"

# ── API Gateway tasks ──
Write-Host "  Project: API Gateway Microservice" -ForegroundColor Yellow
NewTask $p5.id "Design API gateway architecture" "Define routing rules, auth middleware, and rate limiting strategy"   "DONE"        "HIGH"   -8  "Grace Kim"
NewTask $p5.id "Implement JWT validation layer"  "Middleware to validate tokens on all service routes"                 "DONE"        "HIGH"   -3  "David Lee"
NewTask $p5.id "Rate limiting & throttling"      "Add per-user and per-IP rate limits using Redis sliding window"     "IN_PROGRESS" "HIGH"   6   "Alice Johnson"
NewTask $p5.id "Service discovery integration"   "Auto-register services with Consul and update routing table"        "IN_PROGRESS" "MEDIUM" 12  "Grace Kim"
NewTask $p5.id "Circuit breaker pattern"         "Implement Resilience4j circuit breaker for downstream failures"     "TODO"        "HIGH"   16  "David Lee"
NewTask $p5.id "API versioning strategy"         "Support v1/v2 routing with backward-compatible deprecation headers" "TODO"        "MEDIUM" 22  "Grace Kim"
NewTask $p5.id "Gateway performance benchmarks"  "Load test with k6, target <50ms p99 latency at 10k RPS"            "TODO"        "LOW"    29  "Alice Johnson"

# ── DevOps Automation tasks (archived project) ──
Write-Host "  Project: DevOps Automation (Archived)" -ForegroundColor Yellow
NewTask $p6.id "Dockerize all services"          "Write optimized multi-stage Dockerfiles for each microservice"      "DONE"        "HIGH"   -30 "Bob Smith"
NewTask $p6.id "Kubernetes cluster setup"        "Configure EKS cluster with node groups, namespaces, and RBAC"       "DONE"        "HIGH"   -20 "Carol Williams"
NewTask $p6.id "Helm chart templates"            "Write reusable Helm charts for all services"                        "DONE"        "MEDIUM" -15 "Bob Smith"
NewTask $p6.id "Monitoring with Prometheus"      "Set up Prometheus scraping, Grafana dashboards, and alerting rules"  "DONE"        "HIGH"   -10 "Carol Williams"
NewTask $p6.id "Auto-scaling policies"           "HPA and cluster autoscaler policies for production workloads"       "DONE"        "MEDIUM" -5  "Bob Smith"

## ─── Summary ──────────────────────────────────────────────────────────────
Write-Host "`n✅ Seeding complete!" -ForegroundColor Green
Write-Host "   New users  : Carol, David, Eva, Frank, Grace" -ForegroundColor White
Write-Host "   New projects: E-Commerce Platform, Analytics Dashboard, API Gateway, DevOps Automation" -ForegroundColor White
Write-Host "   New tasks  : 28 tasks across 4 projects" -ForegroundColor White
Write-Host "`nAll member password: Member@123" -ForegroundColor DarkGray
