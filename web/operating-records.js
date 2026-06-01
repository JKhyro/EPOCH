(function () {
  const timezoneOffsets = {
    "Asia/Tokyo": "+09:00"
  };

  const offerLabels = {
    education: "Education",
    service_ops: "Service operations",
    consulting: "Consulting",
    technical_support: "Technical support",
    management_system: "Management system"
  };

  function cloneData(data) {
    return JSON.parse(JSON.stringify(data));
  }

  function clean(value) {
    return String(value || "").trim();
  }

  function stamp(now) {
    return now.toISOString().replace(/\D/g, "").slice(0, 14);
  }

  function withTimezone(value, timezone) {
    const raw = clean(value);
    if (!raw) return null;
    if (/[zZ]$|[+-]\d\d:\d\d$/.test(raw)) return raw;
    const offset = timezoneOffsets[timezone] || "+00:00";
    return raw.length === 16 ? `${raw}:00${offset}` : `${raw}${offset}`;
  }

  function ensureCollections(data) {
    for (const collection of ["leads", "customers", "assignments", "submissions", "reviews", "followups", "receipts"]) {
      if (!Array.isArray(data[collection])) data[collection] = [];
    }
  }

  function findFirstVisibleAssignment(data) {
    return data.assignments.find((assignment) => assignment.externalVisible) || data.assignments[0];
  }

  function findReviewableSubmission(data) {
    return data.submissions.find((submission) => submission.status === "reviewing" || submission.status === "submitted")
      || data.submissions[0];
  }

  function trackForOffer(offerKind) {
    return offerKind === "education" ? "track-eiken-upper" : "track-service-ops";
  }

  function createIntakeRecords(currentData, input, options) {
    const nextData = cloneData(currentData);
    ensureCollections(nextData);

    const now = options && options.now ? new Date(options.now) : new Date();
    const timezone = nextData.timezone || "Asia/Tokyo";
    const requestStamp = stamp(now);
    const requesterName = clean(input.requesterName);
    const requestSummary = clean(input.requestSummary);
    const offerKind = clean(input.offerKind) || "education";
    const ageBand = clean(input.ageBand) || "adult";
    const preferredWindow = withTimezone(input.preferredWindow, timezone) || withTimezone(now.toISOString(), timezone);

    if (!requesterName) throw new Error("requesterName is required");
    if (!requestSummary) throw new Error("requestSummary is required");

    const isUnder19 = ageBand === "under-19";
    const trackId = trackForOffer(offerKind);
    const offerLabel = offerLabels[offerKind] || "Commercial service";
    const customerId = `customer-intake-${requestStamp}`;
    const assignmentId = `request-intake-${requestStamp}`;
    const nextAction = isUnder19
      ? "Run compatibility and guardian assessment before acceptance"
      : "Qualify request and propose the first paid diagnostic or service step";

    const lead = {
      id: `lead-intake-${requestStamp}`,
      name: `${requesterName} request`,
      trackId,
      status: isUnder19 ? "waiting" : "planned",
      nextAction,
      nextActionAt: preferredWindow
    };

    const customer = {
      id: customerId,
      displayName: requesterName,
      trackId,
      ageBand,
      externalStatus: isUnder19
        ? "Request received; compatibility and guardian review required before acceptance."
        : "Request received; next update follows internal review."
    };

    const assignment = {
      id: assignmentId,
      customerId,
      title: `${offerLabel} intake request`,
      dueAt: preferredWindow,
      status: "waiting",
      externalVisible: true,
      summary: requestSummary
    };

    const followup = {
      id: `followup-intake-${requestStamp}`,
      customerId,
      title: `Review ${offerLabel.toLowerCase()} request`,
      status: "planned",
      nextActionAt: preferredWindow
    };

    const receipt = {
      id: `receipt-intake-${requestStamp}`,
      customerId,
      kind: "intake-request",
      status: "complete",
      createdAt: withTimezone(now.toISOString(), timezone),
      note: `Captured ${offerLabel.toLowerCase()} request for operating review.`
    };

    nextData.leads.unshift(lead);
    nextData.customers.unshift(customer);
    nextData.assignments.unshift(assignment);
    nextData.followups.unshift(followup);
    nextData.receipts.unshift(receipt);

    return {
      data: nextData,
      records: {
        lead,
        customer,
        assignment,
        followup,
        receipt
      }
    };
  }

  function createSubmissionRecords(currentData, input, options) {
    const nextData = cloneData(currentData);
    ensureCollections(nextData);

    const now = options && options.now ? new Date(options.now) : new Date();
    const timezone = nextData.timezone || "Asia/Tokyo";
    const requestStamp = stamp(now);
    const assignmentId = clean(input.assignmentId) || findFirstVisibleAssignment(nextData)?.id;
    const customerId = clean(input.customerId) || nextData.assignments.find((item) => item.id === assignmentId)?.customerId || nextData.customers[0]?.id;
    const submissionTitle = clean(input.submissionTitle) || "Submitted work";
    const submissionSummary = clean(input.submissionSummary);
    const reviewDueAt = withTimezone(input.reviewDueAt, timezone) || withTimezone(now.toISOString(), timezone);

    if (!assignmentId) throw new Error("assignmentId is required");
    if (!customerId) throw new Error("customerId is required");
    if (!submissionSummary) throw new Error("submissionSummary is required");

    const submission = {
      id: `submission-flow-${requestStamp}`,
      assignmentId,
      customerId,
      title: submissionTitle,
      summary: submissionSummary,
      submittedAt: withTimezone(now.toISOString(), timezone),
      status: "reviewing",
      reviewDueAt
    };

    const review = {
      id: `review-flow-${requestStamp}`,
      submissionId: submission.id,
      owner: "Jack",
      status: "reviewing",
      returnedAt: null,
      summary: "Review in progress; return feedback and next action."
    };

    const followup = {
      id: `followup-review-${requestStamp}`,
      customerId,
      title: `Return review: ${submissionTitle}`,
      status: "planned",
      nextActionAt: reviewDueAt
    };

    const assignment = nextData.assignments.find((item) => item.id === assignmentId);
    if (assignment) assignment.status = "submitted";

    const customer = nextData.customers.find((item) => item.id === customerId);
    if (customer) {
      customer.externalStatus = `${submissionTitle} submitted; review is in progress.`;
    }

    nextData.submissions.unshift(submission);
    nextData.reviews.unshift(review);
    nextData.followups.unshift(followup);

    return {
      data: nextData,
      records: {
        submission,
        review,
        followup
      }
    };
  }

  function returnReviewRecords(currentData, input, options) {
    const nextData = cloneData(currentData);
    ensureCollections(nextData);

    const now = options && options.now ? new Date(options.now) : new Date();
    const timezone = nextData.timezone || "Asia/Tokyo";
    const submissionId = clean(input.submissionId) || findReviewableSubmission(nextData)?.id;
    const returnedSummary = clean(input.returnedSummary) || "Feedback returned with next action.";

    if (!submissionId) throw new Error("submissionId is required");

    const submission = nextData.submissions.find((item) => item.id === submissionId);
    if (!submission) throw new Error("submission not found");

    submission.status = "returned";

    let review = nextData.reviews.find((item) => item.submissionId === submissionId);
    if (!review) {
      review = {
        id: `review-return-${stamp(now)}`,
        submissionId,
        owner: "Jack",
        status: "returned",
        returnedAt: null,
        summary: ""
      };
      nextData.reviews.unshift(review);
    }
    review.status = "returned";
    review.returnedAt = withTimezone(now.toISOString(), timezone);
    review.summary = returnedSummary;

    const assignment = nextData.assignments.find((item) => item.id === submission.assignmentId);
    if (assignment) assignment.status = "returned";

    const customer = nextData.customers.find((item) => item.id === submission.customerId);
    if (customer) {
      customer.externalStatus = `Review returned: ${returnedSummary}`;
    }

    const receipt = {
      id: `receipt-review-${stamp(now)}`,
      customerId: submission.customerId,
      kind: "returned-feedback",
      status: "complete",
      createdAt: withTimezone(now.toISOString(), timezone),
      note: returnedSummary
    };

    nextData.receipts.unshift(receipt);

    return {
      data: nextData,
      records: {
        submission,
        review,
        receipt
      }
    };
  }

  window.EPOCH_OPERATING_RECORDS = {
    cloneData,
    createIntakeRecords,
    createSubmissionRecords,
    returnReviewRecords,
    withTimezone
  };
})();
