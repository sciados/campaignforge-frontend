# Campaign Orchestration & Platform Integration Implementation Guide

*Detailed technical implementation for automated campaign generation and multi-platform publishing*

## Overview

This guide provides step-by-step implementation details for transforming CampaignForge into a complete campaign automation platform. The system will automatically generate complete marketing campaigns and publish them across multiple platforms using API integrations.

## Phase 5: Campaign Orchestration Implementation

### 1. Campaign Orchestration Service

#### Core Service Architecture
```python
# File: src/campaigns/services/campaign_orchestration_service.py

from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from enum import Enum

class AutomationLevel(str, Enum):
    MANUAL = "manual"
    SEMI_AUTOMATED = "semi_automated"
    FULLY_AUTOMATED = "fully_automated"
    AI_OPTIMIZED = "ai_optimized"

class CampaignType(str, Enum):
    PRODUCT_LAUNCH = "product_launch"
    NURTURE_SEQUENCE = "nurture_sequence"
    RE_ENGAGEMENT = "re_engagement"
    BRAND_AWARENESS = "brand_awareness"
    SALES_CONVERSION = "sales_conversion"

class CampaignOrchestrationService:
    """Service for automated campaign generation and orchestration"""
    
    def __init__(self):
        self.intelligence_service = IntelligenceContentService()
        self.platform_service = PlatformIntegrationService()
        self.content_coordinator = MultimediaCoordinationService()
        
    async def generate_complete_campaign(
        self,
        campaign_request: CampaignGenerationRequest,
        user_id: str,
        session
    ) -> CompleteCampaign:
        """Generate a complete marketing campaign with content and timeline"""
        
        try:
            # Step 1: Analyze intelligence and create strategy
            campaign_strategy = await self._generate_campaign_strategy(
                campaign_request, user_id, session
            )
            
            # Step 2: Create content calendar
            content_calendar = await self._create_content_calendar(
                campaign_strategy, campaign_request.duration_days
            )
            
            # Step 3: Generate all content items
            campaign_content = await self._generate_campaign_content(
                content_calendar, campaign_strategy, user_id, session
            )
            
            # Step 4: Create publishing timeline
            publishing_timeline = await self._create_publishing_timeline(
                campaign_content, campaign_request.platforms
            )
            
            # Step 5: Set up automation (if requested)
            automation_setup = None
            if campaign_request.automation_level != AutomationLevel.MANUAL:
                automation_setup = await self._setup_campaign_automation(
                    publishing_timeline, campaign_request.automation_level
                )
            
            # Step 6: Save campaign to database
            campaign = await self._save_campaign_to_database(
                campaign_request, campaign_strategy, campaign_content,
                publishing_timeline, automation_setup, user_id, session
            )
            
            return CompleteCampaign(
                campaign_id=campaign.id,
                strategy=campaign_strategy,
                content_calendar=content_calendar,
                content=campaign_content,
                timeline=publishing_timeline,
                automation=automation_setup,
                estimated_performance=campaign_strategy.performance_prediction
            )
            
        except Exception as e:
            logger.error(f"Campaign generation failed: {e}")
            raise CampaignGenerationException(f"Failed to generate campaign: {str(e)}")
    
    async def _generate_campaign_strategy(
        self, 
        request: CampaignGenerationRequest,
        user_id: str,
        session
    ) -> CampaignStrategy:
        """Generate intelligent campaign strategy based on product intelligence"""
        
        # Get intelligence data for strategy
        intelligence_data = await self.intelligence_service._step1_extract_intelligence_data(
            user_id=user_id,
            company_id=request.company_id,
            content_type="campaign_strategy",
            session=session
        )
        
        # Analyze target audience and market positioning
        audience_analysis = self._analyze_target_audience(intelligence_data)
        market_positioning = self._extract_market_positioning(intelligence_data)
        competitive_advantages = self._identify_competitive_advantages(intelligence_data)
        
        # Generate campaign strategy using AI
        strategy_prompt = self._create_strategy_prompt(
            request, audience_analysis, market_positioning, competitive_advantages
        )
        
        strategy_result = await self._generate_strategy_with_ai(strategy_prompt)
        
        return CampaignStrategy(
            campaign_type=request.campaign_type,
            target_audience=audience_analysis,
            key_messages=strategy_result["key_messages"],
            content_themes=strategy_result["content_themes"],
            platform_strategy=strategy_result["platform_strategy"],
            timeline_strategy=strategy_result["timeline_strategy"],
            success_metrics=strategy_result["success_metrics"],
            performance_prediction=strategy_result["performance_prediction"]
        )
    
    async def _create_content_calendar(
        self,
        strategy: CampaignStrategy,
        duration_days: int
    ) -> ContentCalendar:
        """Create detailed content calendar based on campaign strategy"""
        
        calendar_items = []
        start_date = datetime.now()
        
        # Generate content schedule based on campaign type
        if strategy.campaign_type == CampaignType.PRODUCT_LAUNCH:
            calendar_items = self._create_product_launch_calendar(
                start_date, duration_days, strategy
            )
        elif strategy.campaign_type == CampaignType.NURTURE_SEQUENCE:
            calendar_items = self._create_nurture_calendar(
                start_date, duration_days, strategy
            )
        elif strategy.campaign_type == CampaignType.RE_ENGAGEMENT:
            calendar_items = self._create_reengagement_calendar(
                start_date, duration_days, strategy
            )
        else:
            calendar_items = self._create_generic_calendar(
                start_date, duration_days, strategy
            )
        
        return ContentCalendar(
            start_date=start_date,
            end_date=start_date + timedelta(days=duration_days),
            items=calendar_items,
            total_content_pieces=len(calendar_items),
            content_distribution=self._analyze_content_distribution(calendar_items)
        )
```

#### Campaign Strategy Templates
```python
# File: src/campaigns/templates/campaign_templates.py

class CampaignTemplates:
    """Pre-built campaign templates for different business scenarios"""
    
    PRODUCT_LAUNCH_30_DAY = {
        "name": "30-Day Product Launch",
        "description": "Complete product launch with pre-launch, launch, and post-launch phases",
        "duration_days": 30,
        "phases": [
            {
                "name": "Pre-Launch (Days -7 to 0)",
                "content_types": ["teaser_posts", "behind_scenes", "early_access_emails"],
                "frequency": "daily",
                "platforms": ["facebook", "instagram", "email"]
            },
            {
                "name": "Launch Week (Days 1-7)",
                "content_types": ["launch_announcements", "product_demos", "press_releases"],
                "frequency": "2x_daily",
                "platforms": ["all_platforms"]
            },
            {
                "name": "Momentum Building (Days 8-21)",
                "content_types": ["customer_testimonials", "use_cases", "educational_content"],
                "frequency": "daily",
                "platforms": ["social_media", "blog", "email"]
            },
            {
                "name": "Conversion Optimization (Days 22-30)",
                "content_types": ["urgency_content", "social_proof", "final_offers"],
                "frequency": "daily",
                "platforms": ["email", "social_media", "ads"]
            }
        ]
    }
    
    NURTURE_SEQUENCE_60_DAY = {
        "name": "60-Day Nurture Sequence",
        "description": "Educational content series to build trust and drive conversions",
        "duration_days": 60,
        "phases": [
            {
                "name": "Problem Awareness (Weeks 1-2)",
                "content_types": ["educational_posts", "problem_identification", "industry_insights"],
                "frequency": "3x_week",
                "platforms": ["blog", "social_media", "email"]
            },
            {
                "name": "Solution Education (Weeks 3-5)",
                "content_types": ["how_to_guides", "solution_comparisons", "case_studies"],
                "frequency": "3x_week",
                "platforms": ["blog", "email", "video"]
            },
            {
                "name": "Trust Building (Weeks 6-7)",
                "content_types": ["testimonials", "social_proof", "expert_content"],
                "frequency": "daily",
                "platforms": ["all_platforms"]
            },
            {
                "name": "Conversion Sequence (Week 8)",
                "content_types": ["product_demos", "trial_offers", "consultations"],
                "frequency": "daily",
                "platforms": ["email", "social_media", "landing_pages"]
            }
        ]
    }
```

### 2. Content Generation Coordination

#### Multimedia Content Coordination
```python
# File: src/campaigns/services/multimedia_coordination_service.py

class MultimediaCoordinationService:
    """Coordinates multimedia content generation for campaigns"""
    
    async def generate_coordinated_campaign_content(
        self,
        content_calendar: ContentCalendar,
        campaign_strategy: CampaignStrategy,
        user_id: str,
        session
    ) -> CampaignContent:
        """Generate all content for campaign with cross-media coordination"""
        
        generated_content = {}
        content_themes = campaign_strategy.content_themes
        brand_guidelines = await self._get_brand_guidelines(user_id, session)
        
        for calendar_item in content_calendar.items:
            # Generate content based on calendar item type
            if calendar_item.content_type == "email_sequence":
                content = await self._generate_email_sequence(
                    calendar_item, content_themes, brand_guidelines
                )
            elif calendar_item.content_type == "social_posts":
                content = await self._generate_social_media_content(
                    calendar_item, content_themes, brand_guidelines
                )
            elif calendar_item.content_type == "blog_post":
                content = await self._generate_blog_content(
                    calendar_item, content_themes, brand_guidelines
                )
            elif calendar_item.content_type == "video_content":
                content = await self._generate_video_content(
                    calendar_item, content_themes, brand_guidelines
                )
            elif calendar_item.content_type == "ad_copy":
                content = await self._generate_ad_content(
                    calendar_item, content_themes, brand_guidelines
                )
            
            generated_content[calendar_item.id] = content
        
        # Ensure content consistency across all pieces
        consistent_content = await self._ensure_content_consistency(
            generated_content, brand_guidelines
        )
        
        return CampaignContent(
            items=consistent_content,
            total_pieces=len(consistent_content),
            content_distribution=self._analyze_content_types(consistent_content),
            brand_consistency_score=self._calculate_consistency_score(consistent_content)
        )
```

### 3. Publishing Timeline Generation

#### Timeline Optimization Service
```python
# File: src/campaigns/services/timeline_optimization_service.py

class TimelineOptimizationService:
    """Optimizes publishing timeline for maximum engagement"""
    
    async def create_optimized_timeline(
        self,
        campaign_content: CampaignContent,
        platforms: List[str],
        target_audience: TargetAudience
    ) -> PublishingTimeline:
        """Create optimized publishing timeline across platforms"""
        
        timeline_items = []
        
        for content_id, content in campaign_content.items.items():
            # Determine optimal posting times for each platform
            for platform in platforms:
                optimal_time = await self._calculate_optimal_posting_time(
                    platform, target_audience, content.content_type
                )
                
                timeline_item = TimelineItem(
                    content_id=content_id,
                    platform=platform,
                    scheduled_time=optimal_time,
                    content_type=content.content_type,
                    priority_score=self._calculate_priority_score(content, platform),
                    expected_engagement=self._predict_engagement(content, platform, optimal_time)
                )
                
                timeline_items.append(timeline_item)
        
        # Optimize timeline to avoid conflicts and maximize engagement
        optimized_timeline = self._optimize_timeline_distribution(timeline_items)
        
        return PublishingTimeline(
            items=optimized_timeline,
            total_posts=len(optimized_timeline),
            platform_distribution=self._analyze_platform_distribution(optimized_timeline),
            estimated_reach=self._calculate_estimated_reach(optimized_timeline),
            optimization_score=self._calculate_optimization_score(optimized_timeline)
        )
```

## Phase 6: Platform API Integrations

### 1. Platform Integration Service

#### Core Integration Architecture
```python
# File: src/integrations/services/platform_integration_service.py

class PlatformIntegrationService:
    """Unified service for managing all platform API connections"""
    
    def __init__(self):
        self.platforms = {
            'facebook': FacebookIntegration(),
            'instagram': InstagramIntegration(),
            'twitter': TwitterIntegration(),
            'linkedin': LinkedInIntegration(),
            'tiktok': TikTokIntegration(),
            'youtube': YouTubeIntegration(),
            'wordpress': WordPressIntegration(),
            'mailchimp': MailchimpIntegration(),
            'convertkit': ConvertKitIntegration()
        }
        
        self.oauth_manager = OAuthManager()
        self.rate_limiter = RateLimitManager()
        self.error_handler = PublishingErrorHandler()
    
    async def publish_content(
        self,
        content: ContentItem,
        platform: str,
        user_id: str,
        schedule_time: Optional[datetime] = None
    ) -> PublishResult:
        """Publish content to specified platform"""
        
        try:
            # Validate platform integration
            platform_service = self.platforms.get(platform)
            if not platform_service:
                raise UnsupportedPlatformError(f"Platform {platform} not supported")
            
            # Check user has connected this platform
            credentials = await self.oauth_manager.get_platform_credentials(
                user_id, platform
            )
            if not credentials:
                raise PlatformNotConnectedError(f"User not connected to {platform}")
            
            # Check rate limits
            rate_limit_check = await self.rate_limiter.check_rate_limit(
                user_id, platform
            )
            if not rate_limit_check.allowed:
                return PublishResult(
                    success=False,
                    error="Rate limit exceeded",
                    retry_after=rate_limit_check.retry_after
                )
            
            # Validate content for platform
            validation_result = await platform_service.validate_content(content)
            if not validation_result.valid:
                return PublishResult(
                    success=False,
                    error=f"Content validation failed: {validation_result.errors}"
                )
            
            # Publish content
            if schedule_time and schedule_time > datetime.now():
                # Schedule for future publishing
                result = await platform_service.schedule_content(
                    content, schedule_time, credentials
                )
            else:
                # Publish immediately
                result = await platform_service.publish_immediately(
                    content, credentials
                )
            
            # Track rate limit usage
            await self.rate_limiter.record_api_call(user_id, platform)
            
            # Log publishing result
            await self._log_publishing_result(user_id, platform, content, result)
            
            return result
            
        except Exception as e:
            error_result = await self.error_handler.handle_publishing_error(
                e, user_id, platform, content
            )
            return error_result
    
    async def publish_campaign(
        self,
        campaign: Campaign,
        timeline: PublishingTimeline,
        user_id: str
    ) -> CampaignPublishingResult:
        """Publish entire campaign according to timeline"""
        
        results = []
        failed_items = []
        
        for timeline_item in timeline.items:
            try:
                content = campaign.content.items[timeline_item.content_id]
                
                result = await self.publish_content(
                    content=content,
                    platform=timeline_item.platform,
                    user_id=user_id,
                    schedule_time=timeline_item.scheduled_time
                )
                
                results.append(result)
                
                if not result.success:
                    failed_items.append(timeline_item)
                    
            except Exception as e:
                logger.error(f"Failed to publish {timeline_item.content_id} to {timeline_item.platform}: {e}")
                failed_items.append(timeline_item)
        
        return CampaignPublishingResult(
            campaign_id=campaign.id,
            total_items=len(timeline.items),
            successful_items=len([r for r in results if r.success]),
            failed_items=len(failed_items),
            results=results,
            failed_timeline_items=failed_items
        )
```

### 2. OAuth Management System

#### OAuth Manager Implementation
```python
# File: src/integrations/auth/oauth_manager.py

class OAuthManager:
    """Centralized OAuth management for all platforms"""
    
    def __init__(self):
        self.encryption_service = EncryptionService()
        self.token_storage = TokenStorage()
    
    async def initiate_oauth_flow(
        self,
        platform: str,
        user_id: str,
        redirect_uri: str
    ) -> OAuthFlowResult:
        """Initiate OAuth flow for platform connection"""
        
        platform_config = self._get_platform_oauth_config(platform)
        
        # Generate state parameter for security
        state = self._generate_secure_state(user_id, platform)
        
        # Build OAuth URL
        oauth_url = self._build_oauth_url(
            platform_config, redirect_uri, state
        )
        
        # Store state for validation
        await self.token_storage.store_oauth_state(
            user_id, platform, state, expires_in=600  # 10 minutes
        )
        
        return OAuthFlowResult(
            oauth_url=oauth_url,
            state=state,
            expires_at=datetime.now() + timedelta(minutes=10)
        )
    
    async def handle_oauth_callback(
        self,
        platform: str,
        code: str,
        state: str,
        user_id: str
    ) -> OAuthCallbackResult:
        """Handle OAuth callback and exchange code for tokens"""
        
        try:
            # Validate state parameter
            stored_state = await self.token_storage.get_oauth_state(user_id, platform)
            if not stored_state or stored_state != state:
                raise OAuthSecurityError("Invalid state parameter")
            
            # Exchange authorization code for tokens
            platform_config = self._get_platform_oauth_config(platform)
            token_response = await self._exchange_code_for_tokens(
                platform_config, code
            )
            
            # Encrypt and store tokens
            encrypted_access_token = await self.encryption_service.encrypt(
                token_response.access_token
            )
            encrypted_refresh_token = None
            if token_response.refresh_token:
                encrypted_refresh_token = await self.encryption_service.encrypt(
                    token_response.refresh_token
                )
            
            # Get platform user information
            platform_user_info = await self._get_platform_user_info(
                platform, token_response.access_token
            )
            
            # Store platform integration
            integration = PlatformIntegration(
                user_id=user_id,
                platform=platform,
                access_token=encrypted_access_token,
                refresh_token=encrypted_refresh_token,
                token_expires_at=datetime.now() + timedelta(
                    seconds=token_response.expires_in
                ),
                platform_user_id=platform_user_info.user_id,
                platform_username=platform_user_info.username,
                scopes=token_response.scopes,
                is_active=True
            )
            
            await self.token_storage.store_platform_integration(integration)
            
            # Clean up OAuth state
            await self.token_storage.delete_oauth_state(user_id, platform)
            
            return OAuthCallbackResult(
                success=True,
                platform_user_info=platform_user_info,
                scopes_granted=token_response.scopes
            )
            
        except Exception as e:
            logger.error(f"OAuth callback failed for {platform}: {e}")
            return OAuthCallbackResult(
                success=False,
                error=str(e)
            )
```

### 3. Individual Platform Integrations

#### Facebook/Instagram Integration
```python
# File: src/integrations/platforms/facebook_integration.py

class FacebookIntegration(BasePlatformIntegration):
    """Facebook and Instagram publishing integration"""
    
    BASE_URL = "https://graph.facebook.com/v18.0"
    
    async def publish_immediately(
        self,
        content: ContentItem,
        credentials: PlatformCredentials
    ) -> PublishResult:
        """Publish content immediately to Facebook/Instagram"""
        
        try:
            if content.platform_type == "facebook_page":
                return await self._publish_facebook_post(content, credentials)
            elif content.platform_type == "instagram_feed":
                return await self._publish_instagram_post(content, credentials)
            elif content.platform_type == "instagram_story":
                return await self._publish_instagram_story(content, credentials)
            else:
                raise UnsupportedContentTypeError(
                    f"Unsupported content type: {content.platform_type}"
                )
                
        except Exception as e:
            return PublishResult(
                success=False,
                error=str(e),
                platform="facebook"
            )
    
    async def _publish_facebook_post(
        self,
        content: ContentItem,
        credentials: PlatformCredentials
    ) -> PublishResult:
        """Publish post to Facebook page"""
        
        endpoint = f"{self.BASE_URL}/{credentials.page_id}/feed"
        
        payload = {
            "message": content.text,
            "access_token": credentials.access_token
        }
        
        # Add media if present
        if content.images:
            if len(content.images) == 1:
                # Single image
                payload["url"] = content.images[0].url
            else:
                # Multiple images - create photo album
                return await self._publish_facebook_album(content, credentials)
        
        # Add video if present
        if content.video:
            return await self._publish_facebook_video(content, credentials)
        
        async with aiohttp.ClientSession() as session:
            async with session.post(endpoint, data=payload) as response:
                if response.status == 200:
                    result_data = await response.json()
                    return PublishResult(
                        success=True,
                        platform_post_id=result_data["id"],
                        platform="facebook",
                        published_url=f"https://facebook.com/{result_data['id']}"
                    )
                else:
                    error_data = await response.json()
                    return PublishResult(
                        success=False,
                        error=error_data.get("error", {}).get("message", "Unknown error"),
                        platform="facebook"
                    )
```

#### Email Platform Integration (Mailchimp)
```python
# File: src/integrations/platforms/mailchimp_integration.py

class MailchimpIntegration(BasePlatformIntegration):
    """Mailchimp email marketing integration"""
    
    def __init__(self):
        self.base_url = "https://{dc}.api.mailchimp.com/3.0"
    
    async def create_campaign(
        self,
        email_sequence: EmailSequence,
        credentials: PlatformCredentials
    ) -> PublishResult:
        """Create email campaign in Mailchimp"""
        
        try:
            # Create campaign
            campaign_data = {
                "type": "regular",
                "recipients": {
                    "list_id": credentials.list_id
                },
                "settings": {
                    "subject_line": email_sequence.emails[0].subject,
                    "from_name": credentials.from_name,
                    "reply_to": credentials.reply_to
                }
            }
            
            campaign = await self._create_mailchimp_campaign(
                campaign_data, credentials
            )
            
            # Set campaign content
            await self._set_campaign_content(
                campaign["id"],
                email_sequence.emails[0].html_content,
                credentials
            )
            
            # Schedule or send campaign
            if email_sequence.send_immediately:
                result = await self._send_campaign(campaign["id"], credentials)
            else:
                result = await self._schedule_campaign(
                    campaign["id"],
                    email_sequence.schedule_time,
                    credentials
                )
            
            return PublishResult(
                success=True,
                platform_post_id=campaign["id"],
                platform="mailchimp",
                campaign_url=campaign["archive_url"]
            )
            
        except Exception as e:
            return PublishResult(
                success=False,
                error=str(e),
                platform="mailchimp"
            )
```

### 4. Campaign Automation Engine

#### Automation Execution Service
```python
# File: src/campaigns/services/automation_execution_service.py

class AutomationExecutionService:
    """Executes automated campaign publishing and optimization"""
    
    def __init__(self):
        self.platform_service = PlatformIntegrationService()
        self.performance_monitor = PerformanceMonitoringService()
        self.optimization_engine = CampaignOptimizationEngine()
    
    async def execute_campaign_automation(
        self,
        campaign: Campaign,
        automation_level: AutomationLevel
    ):
        """Execute campaign according to automation level"""
        
        if automation_level == AutomationLevel.SEMI_AUTOMATED:
            await self._execute_semi_automated_campaign(campaign)
        elif automation_level == AutomationLevel.FULLY_AUTOMATED:
            await self._execute_fully_automated_campaign(campaign)
        elif automation_level == AutomationLevel.AI_OPTIMIZED:
            await self._execute_ai_optimized_campaign(campaign)
    
    async def _execute_fully_automated_campaign(
        self,
        campaign: Campaign
    ):
        """Execute fully automated campaign with safety checks"""
        
        # Monitor campaign timeline
        while campaign.status == "active":
            # Check for items ready to publish
            ready_items = await self._get_items_ready_for_publishing(campaign)
            
            for item in ready_items:
                # Perform safety checks
                safety_check = await self._perform_safety_checks(item)
                if not safety_check.passed:
                    logger.warning(f"Safety check failed for {item.id}: {safety_check.reason}")
                    continue
                
                # Publish content
                result = await self.platform_service.publish_content(
                    content=item.content,
                    platform=item.platform,
                    user_id=campaign.user_id
                )
                
                # Update item status
                await self._update_item_status(item, result)
                
                # Monitor performance
                await self.performance_monitor.start_monitoring(item, result)
            
            # Check for optimization opportunities
            if campaign.automation_level == AutomationLevel.AI_OPTIMIZED:
                optimization_suggestions = await self.optimization_engine.analyze_campaign(
                    campaign
                )
                await self._apply_approved_optimizations(
                    campaign, optimization_suggestions
                )
            
            # Wait before next check
            await asyncio.sleep(300)  # Check every 5 minutes
```

## Database Schema Updates

### Campaign Management Tables
```sql
-- Enhanced campaigns table
CREATE TABLE campaigns (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR NOT NULL,
    company_id VARCHAR,
    name VARCHAR NOT NULL,
    campaign_type VARCHAR NOT NULL,
    automation_level VARCHAR DEFAULT 'manual',
    status VARCHAR DEFAULT 'draft',
    
    -- Campaign strategy
    strategy JSON NOT NULL,
    target_audience JSON,
    key_messages JSON DEFAULT '[]',
    content_themes JSON DEFAULT '[]',
    
    -- Content and timeline
    content_calendar JSON NOT NULL,
    publishing_timeline JSON NOT NULL,
    
    -- Performance tracking
    estimated_performance JSON,
    actual_performance JSON DEFAULT '{}',
    
    -- Automation settings
    automation_config JSON DEFAULT '{}',
    safety_settings JSON DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    starts_at TIMESTAMP,
    ends_at TIMESTAMP,
    
    INDEX idx_campaigns_user (user_id),
    INDEX idx_campaigns_status (status),
    INDEX idx_campaigns_type (campaign_type)
);

-- Campaign content items
CREATE TABLE campaign_content (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id VARCHAR REFERENCES campaigns(id) ON DELETE CASCADE,
    content_type VARCHAR NOT NULL,
    platform VARCHAR NOT NULL,
    
    -- Content data
    content_data JSON NOT NULL,
    generated_at TIMESTAMP DEFAULT NOW(),
    
    -- Scheduling
    scheduled_time TIMESTAMP,
    publish_status VARCHAR DEFAULT 'scheduled',
    published_at TIMESTAMP,
    
    -- Platform response
    platform_post_id VARCHAR,
    platform_response JSON DEFAULT '{}',
    
    -- Performance data
    engagement_data JSON DEFAULT '{}',
    performance_metrics JSON DEFAULT '{}',
    
    INDEX idx_content_campaign (campaign_id),
    INDEX idx_content_platform (platform),
    INDEX idx_content_schedule (scheduled_time),
    INDEX idx_content_status (publish_status)
);

-- Platform integrations (OAuth tokens)
CREATE TABLE platform_integrations (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR NOT NULL,
    platform VARCHAR NOT NULL,
    
    -- Encrypted tokens
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    
    -- Platform user info
    platform_user_id VARCHAR,
    platform_username VARCHAR,
    scopes JSON DEFAULT '[]',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP,
    connected_at TIMESTAMP DEFAULT NOW(),
    
    -- Rate limiting
    daily_api_calls INTEGER DEFAULT 0,
    last_reset_date DATE DEFAULT CURRENT_DATE,
    
    UNIQUE(user_id, platform),
    INDEX idx_platform_user (user_id),
    INDEX idx_platform_type (platform),
    INDEX idx_token_expiry (token_expires_at)
);

-- Publishing results tracking
CREATE TABLE publishing_results (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id VARCHAR REFERENCES campaigns(id),
    content_id VARCHAR REFERENCES campaign_content(id),
    
    -- Publishing details
    platform VARCHAR NOT NULL,
    publish_attempt_at TIMESTAMP DEFAULT NOW(),
    publish_status VARCHAR NOT NULL, -- 'success', 'failed', 'retry'
    
    -- Platform response
    platform_post_id VARCHAR,
    platform_response JSON DEFAULT '{}',
    error_data JSON DEFAULT '{}',
    
    -- Performance data
    engagement_metrics JSON DEFAULT '{}',
    performance_score FLOAT,
    
    INDEX idx_results_campaign (campaign_id),
    INDEX idx_results_content (content_id),
    INDEX idx_results_platform (platform),
    INDEX idx_results_status (publish_status)
);

-- Automation execution logs
CREATE TABLE automation_logs (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id VARCHAR REFERENCES campaigns(id),
    automation_type VARCHAR NOT NULL,
    
    -- Execution details
    executed_at TIMESTAMP DEFAULT NOW(),
    execution_status VARCHAR NOT NULL,
    execution_data JSON DEFAULT '{}',
    
    -- Results
    items_processed INTEGER DEFAULT 0,
    items_successful INTEGER DEFAULT 0,
    items_failed INTEGER DEFAULT 0,
    
    -- Performance impact
    performance_impact JSON DEFAULT '{}',
    
    INDEX idx_automation_campaign (campaign_id),
    INDEX idx_automation_type (automation_type),
    INDEX idx_automation_status (execution_status)
);
```

## API Endpoints

### Campaign Orchestration API
```python
# File: src/campaigns/api/campaign_orchestration_routes.py

@router.post("/campaigns/generate", response_model=SuccessResponse[CompleteCampaign])
async def generate_complete_campaign(
    request: CampaignGenerationRequest,
    credentials: HTTPBearer = Depends(security),
    session: AsyncSession = Depends(get_async_db)
):
    """Generate complete automated marketing campaign"""
    
    user_id = AuthMiddleware.require_authentication(credentials)
    
    try:
        orchestration_service = CampaignOrchestrationService()
        
        campaign = await orchestration_service.generate_complete_campaign(
            campaign_request=request,
            user_id=user_id,
            session=session
        )
        
        return SuccessResponse(
            data=campaign,
            message="Complete campaign generated successfully"
        )
        
    except Exception as e:
        logger.error(f"Campaign generation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate campaign"
        )

@router.post("/campaigns/{campaign_id}/publish", response_model=SuccessResponse[CampaignPublishingResult])
async def publish_campaign(
    campaign_id: str,
    publish_request: CampaignPublishRequest,
    credentials: HTTPBearer = Depends(security),
    session: AsyncSession = Depends(get_async_db)
):
    """Publish campaign across all connected platforms"""
    
    user_id = AuthMiddleware.require_authentication(credentials)
    
    try:
        platform_service = PlatformIntegrationService()
        
        # Get campaign
        campaign = await get_campaign_by_id(campaign_id, user_id, session)
        if not campaign:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found"
            )
        
        # Publish campaign
        result = await platform_service.publish_campaign(
            campaign=campaign,
            timeline=campaign.publishing_timeline,
            user_id=user_id
        )
        
        return SuccessResponse(
            data=result,
            message="Campaign publishing initiated"
        )
        
    except Exception as e:
        logger.error(f"Campaign publishing failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to publish campaign"
        )
```

### Platform Integration API
```python
# File: src/integrations/api/platform_integration_routes.py

@router.get("/integrations/platforms", response_model=SuccessResponse[List[PlatformStatus]])
async def get_platform_integrations(
    credentials: HTTPBearer = Depends(security)
):
    """Get user's platform integration status"""
    
    user_id = AuthMiddleware.require_authentication(credentials)
    
    try:
        oauth_manager = OAuthManager()
        
        platform_statuses = await oauth_manager.get_user_platform_statuses(user_id)
        
        return SuccessResponse(
            data=platform_statuses,
            message="Platform integrations retrieved"
        )
        
    except Exception as e:
        logger.error(f"Failed to get platform integrations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve platform integrations"
        )

@router.post("/integrations/{platform}/connect", response_model=SuccessResponse[OAuthFlowResult])
async def initiate_platform_connection(
    platform: str,
    redirect_uri: str,
    credentials: HTTPBearer = Depends(security)
):
    """Initiate OAuth flow for platform connection"""
    
    user_id = AuthMiddleware.require_authentication(credentials)
    
    try:
        oauth_manager = OAuthManager()
        
        oauth_result = await oauth_manager.initiate_oauth_flow(
            platform=platform,
            user_id=user_id,
            redirect_uri=redirect_uri
        )
        
        return SuccessResponse(
            data=oauth_result,
            message=f"OAuth flow initiated for {platform}"
        )
        
    except Exception as e:
        logger.error(f"OAuth initiation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to initiate OAuth flow for {platform}"
        )
```

This implementation guide provides the complete technical foundation for building CampaignForge's campaign orchestration and platform integration capabilities. The system will automatically generate complete marketing campaigns and publish them across multiple platforms while maintaining intelligent cost optimization and performance monitoring.