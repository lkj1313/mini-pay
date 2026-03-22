# Mini Pay

Mini Pay는 송금, 적금, 거래내역, 세션 관리를 하나의 흐름으로 묶어 구현한 개인 프로젝트입니다.  
간단한 결제 서비스를 만드는 데서 출발했지만, 구현 과정에서는 `송금 트랜잭션`, `Redis 세션`, `적금 배치`, `거래 이름 스냅샷`, `성능 테스트 환경`처럼 금융 서비스에 가까운 문제를 직접 다뤄보는 데 집중했습니다.

## 왜 만들었는가

일반적인 CRUD 프로젝트보다 한 단계 더 나아가서,

- 돈이 실제로 이동하는 흐름을 어떻게 안전하게 다룰지
- 로그인 상태와 세션을 어떻게 관리할지
- 정기 작업(이자 지급, 자동이체)을 어떻게 분리할지
- 거래내역이 시간이 지나도 왜곡되지 않게 어떻게 기록할지

같은 문제를 직접 설계하고 구현해보고 싶었습니다.

## 핵심 기능

### 인증 / 세션
- 회원가입 / 로그인 / 로그아웃
- Redis 기반 세션 저장
- 세션 idle 10분 관리
- 세션 만료 시 프론트 자동 정리

### 지갑
- 회원가입 시 메인 계좌 자동 생성
- 메인 계좌 직접 충전
- 메인 -> 적금 계좌 이체
- 사용자 간 메인 계좌 송금
  - 잔액 부족 시 1만 원 단위 자동충전 후 송금

### 적금
- 적금 계좌 생성
  - 자유 적금
  - 정기 적금
- 자유 적금: 연 3% 단리
- 정기 적금: 연 5% 단리
- 매일 오전 4시 적금 이자 지급 배치
- 매일 오전 8시 정기 적금 자동이체 배치

### 거래내역
- 내 거래내역 조회
- 거래 유형 구분
  - 직접 충전
  - 사용자 송금
  - 메인 -> 적금 이체
  - 적금 이자 지급
- 거래 시점 이름 스냅샷 저장

## 기술 스택

### Backend
- NestJS
- Prisma
- PostgreSQL
- Redis
- Swagger
- Jest

### Frontend
- Next.js App Router
- React Query
- React Hook Form
- Zod
- shadcn/ui
- Jest + Testing Library

### Infra / Tooling
- pnpm workspace
- Turbo
- Docker Compose
- nGrinder

## 구조

```text
Web (Next.js)
  -> API (NestJS)
    -> PostgreSQL
    -> Redis

Batch
  -> Savings interest batch
  -> Fixed savings auto-transfer batch
```

## 구현하면서 중요하게 본 점

### 1. 세션은 Redis에 저장
로그인 상태를 DB가 아니라 Redis에 저장하고, 요청이 들어올 때마다 idle TTL을 갱신하도록 구성했습니다.  
이 방식으로 세션 조회는 빠르게 처리하고, 세션 만료 정책도 단순하게 유지할 수 있었습니다.

### 2. 금액은 BigInt로 다루고 응답 직전에 문자열로 변환
잔액과 거래 금액은 Prisma `BigInt` 컬럼으로 관리했습니다.  
대신 JSON 응답에서는 `BigInt`가 바로 직렬화되지 않기 때문에, API 응답 직전에 문자열로 변환하는 방식을 사용했습니다.

### 3. 거래 시점 이름을 별도로 저장
거래내역을 현재 사용자 이름 join 결과로만 보여주면, 사용자가 나중에 이름을 바꿨을 때 과거 거래내역까지 바뀌는 문제가 생깁니다.  
이를 막기 위해 `Transaction`에 이름 스냅샷 컬럼을 두고 거래 생성 시점 이름을 저장하도록 구현했습니다.

### 4. 적금 정보는 Wallet과 분리
메인 계좌와 적금 계좌는 같은 `Wallet` 모델로 관리하되, 적금 상품 정보는 `SavingsDetail` 1:1 테이블로 분리했습니다.  
덕분에 `FREE / FIXED`, 이율, 자동이체 금액, 마지막 배치 실행 시각 같은 적금 전용 속성을 명확히 표현할 수 있었습니다.

### 5. 배치와 실시간 지갑 로직 분리
실시간 송금/이체는 `wallet` 모듈에, 적금 이자 지급과 자동이체는 `savings` 모듈에 두었습니다.  
실시간 요청과 정기 작업이 서로 역할을 침범하지 않게 분리하는 데 신경 썼습니다.

## 테스트 / 검증

### 단위 테스트
- Backend
  - 서비스
  - 컨트롤러
  - 적금 배치 로직
- Frontend
  - 인증 폼
  - 지갑 액션 모달
  - 적금 생성 폼 / 다이얼로그

### 부하 테스트 준비
- nGrinder controller / agent를 Docker Compose로 구성
- 로그인 -> 지갑 조회 -> 송금 -> 거래내역 조회 시나리오 스크립트 작성
- 로컬에서 세션 쿠키 유지와 기본 API 흐름 검증 완료

## 프로젝트 구조

```text
apps/
  api/
  web/
docs/
infra/
  docker-compose.yml
  ngrinder/
packages/
```

## 실행 환경

### 포트
- Web: `http://localhost:4700`
- API: `http://localhost:4301`
- Swagger: `http://localhost:4301/docs`
- PostgreSQL: `localhost:15432`
- Redis: `localhost:6379`
- nGrinder: `http://localhost:8080`

### 주요 환경 변수

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:15432/mini_pay"
REDIS_HOST=localhost
REDIS_PORT=6379
NEXT_PUBLIC_API_BASE_URL=http://localhost:4301
```

## 다음 개선 포인트

- Pending 송금 구조
- 거래내역 1년 보관 정책
- 정산 기능
- 배치 중복 실행 방지 전략
- 실제 배포 환경에서의 성능 테스트

## 로컬 실행

```bash
pnpm install
cd infra
docker compose up -d
cd ..
pnpm --filter api prisma:migrate:dev
pnpm dev
```
